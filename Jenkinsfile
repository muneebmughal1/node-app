pipeline {
  agent any
  parameters {
    choice (name: 'chooseNode', choices: ['Canary Deployment', 'Regular Deployment'], description: 'Choose which Environment to Deploy: ')
  }
  environment {
    listenerARN = 'arn:aws:elasticloadbalancing:ca-central-1:989848885966:listener/app/blue-green/d19e5f138089f55d/ad6ca7c16847fd9a'
    blueARN = 'arn:aws:elasticloadbalancing:ca-central-1:989848885966:targetgroup/blue/2fd64790fc28b096'
    greenARN = 'arn:aws:elasticloadbalancing:ca-central-1:989848885966:targetgroup/green/2983de9fc0c72cb6'
    EC2_INSTANCE_IP_GREEN = '15.222.239.203'
    EC2_INSTANCE_IP_BLUE = '35.183.46.136'

  }
  stages {
    stage('Deployment Started') {
      parallel {
        stage('Canary Deployment') {
          when {
            expression {
              params.chooseNode == 'Canary Deployment'
            }
          }
          stages {
            stage('Offloading Canary Environment') {
              steps {
                sh """/usr/local/bin/aws elbv2 modify-listener --listener-arn ${listenerARN} --default-actions '[{\"Type\": \"forward\",\"Order\": 1,\"ForwardConfig\": {\"TargetGroups\": [{\"TargetGroupArn\": \"${greenARN}\", \"Weight\": 5 },{\"TargetGroupArn\": \"${blueARN}\", \"Weight\": 95 }],\"TargetGroupStickinessConfig\": {\"Enabled\": true,\"DurationSeconds\": 1}}}]'
"""
              }
            }
            stage('Checkout Code') {
            steps {
                // Checkout your Node.js application code from your version control system (e.g., Git)
                checkout scm
            }
        }

        stage('Deploy to EC2') {
           steps {
              script {
                 // Use the PEM key content directly in the ssh command
                sshagent(credentials: [EC2_INSTANCE_IP_GREEN]) {
                  sh """
                  ssh -o StrictHostKeyChecking=no ubuntu@${EC2_INSTANCE_IP_GREEN} "
                  cd node-app
                  git pull origin main
                  npm install
                  pm2 restart index"
                  """
                }
              }
            }
        }
            stage('Validate and Add Canary environment for testing') {
              steps {
                sh """
                if [ "\$(curl -o /dev/null -s -I -w '%{http_code}' http://${EC2_INSTANCE_IP_GREEN}/health)" -eq 200 ]
                then
                    echo "** BUILD IS SUCCESSFUL **"
                    curl -I http://${EC2_INSTANCE_IP_GREEN}/health
                    /usr/local/bin/aws elbv2 modify-listener --listener-arn ${listenerARN} --default-actions '[{\"Type\": \"forward\",\"Order\": 1,\"ForwardConfig\": {\"TargetGroups\": [{\"TargetGroupArn\": \"${greenARN}\", \"Weight\": 5 },{\"TargetGroupArn\": \"${blueARN}\", \"Weight\": 95 }],\"TargetGroupStickinessConfig\": {\"Enabled\": true,\"DurationSeconds\": 1}}}]'
                else
                    echo "** BUILD IS FAILED ** Health check returned non 200 status code"
                    curl -I http://${EC2_INSTANCE_IP_GREEN}/health
                exit 2
                fi
                """
              }
            }
          }
        }
        stage('Regular Deployment') {
          when {
            expression {
              params.chooseNode == 'Regular Deployment'
            }
          }
          stages {
            stage('Dividing traffic') {
              steps {
                sh """/usr/local/bin/aws elbv2 modify-listener --listener-arn ${listenerARN} --default-actions '[{\"Type\": \"forward\",\"Order\": 1,\"ForwardConfig\": {\"TargetGroups\": [{\"TargetGroupArn\": \"${blueARN}\", \"Weight\": 1 },{\"TargetGroupArn\": \"${greenARN}\", \"Weight\": 1 }],\"TargetGroupStickinessConfig\": {\"Enabled\": true,\"DurationSeconds\": 1}}}]'"""
              }
            }
            stage('Checkout Code') {
            steps {
                // Checkout your Node.js application code from your version control system (e.g., Git)
                checkout scm
            }
        }

        stage('Deploy to EC2') {
           steps {
              script {            
                 // Use the PEM key content directly in the ssh command
                sshagent(credentials: [EC2_INSTANCE_IP_BLUE]) {
                  sh """
                  ssh -o StrictHostKeyChecking=no ubuntu@${EC2_INSTANCE_IP_BLUE} "
                  cd node-app
                  git pull origin main
                  npm install
                  pm2 restart index"
                  """
                }
              }
            }
        }
            stage('Validating Deployment') {
              steps {
                sh """
                if [ "\$(curl -o /dev/null -s -I -w '%{http_code}' http://${EC2_INSTANCE_IP_BLUE}/health)" -eq 200 ]
                then
                    echo "** BUILD IS SUCCESSFUL **"
                    curl -I http://${EC2_INSTANCE_IP_BLUE}/health
                    /usr/local/bin/aws elbv2 modify-listener --listener-arn ${listenerARN} --default-actions '[{\"Type\": \"forward\",\"Order\": 1,\"ForwardConfig\": {\"TargetGroups\": [{\"TargetGroupArn\": \"${blueARN}\", \"Weight\": 1 },{\"TargetGroupArn\": \"${greenARN}\", \"Weight\": 1 }],\"TargetGroupStickinessConfig\": {\"Enabled\": true,\"DurationSeconds\": 1}}}]'
                else
                    echo "** BUILD IS FAILED ** Health check returned non 200 status code"
                    curl -I http://${EC2_INSTANCE_IP_BLUE}/health
                exit 2
                fi
                """
              }
            }
          }
        }
      }
    }
  }
}