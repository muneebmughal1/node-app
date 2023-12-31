pipeline {
  agent any
  parameters {
    choice (name: 'chooseNode', choices: ['Canary Deployment', 'Regular Deployment'], description: 'Choose which Environment to Deploy: ')
  }
  environment {
    listenerARN = 'arn:aws:elasticloadbalancing:us-east-2:328164419144:listener/app/test/f1063324cb00d2c1/77607d396902e9e8'
    server1 = 'arn:aws:elasticloadbalancing:us-east-2:328164419144:targetgroup/server1/b7d7c0a805b1bc56'
    server2 = 'arn:aws:elasticloadbalancing:us-east-2:328164419144:targetgroup/server2/fbe4e7eaa434b1dd'
    EC2_INSTANCE_IP_SERVER2 = '3.14.246.92'
    EC2_INSTANCE_IP_SERVER1 = '18.219.145.144'

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
                sh """/usr/local/bin/aws elbv2 modify-listener --listener-arn ${listenerARN} --default-actions '[{\"Type\": \"forward\",\"Order\": 1,\"ForwardConfig\": {\"TargetGroups\": [{\"TargetGroupArn\": \"${server2}\", \"Weight\": 1 },{\"TargetGroupArn\": \"${server1}\", \"Weight\": 9 }],\"TargetGroupStickinessConfig\": {\"Enabled\": true,\"DurationSeconds\": 1}}}]'
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
                sshagent(credentials: [EC2_INSTANCE_IP_SERVER2]) {
                  sh """
                  ssh -o StrictHostKeyChecking=no ubuntu@${EC2_INSTANCE_IP_SERVER2} "
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
                if [ "\$(curl -o /dev/null -s -I -w '%{http_code}' http://${EC2_INSTANCE_IP_SERVER2}/)" -eq 200 ]
                then
                    echo "** BUILD IS SUCCESSFUL **"
                    curl -I http://${EC2_INSTANCE_IP_SERVER2}/
                    /usr/local/bin/aws elbv2 modify-listener --listener-arn ${listenerARN} --default-actions '[{\"Type\": \"forward\",\"Order\": 1,\"ForwardConfig\": {\"TargetGroups\": [{\"TargetGroupArn\": \"${server2}\", \"Weight\": 1 },{\"TargetGroupArn\": \"${server1}\", \"Weight\": 9 }],\"TargetGroupStickinessConfig\": {\"Enabled\": true,\"DurationSeconds\": 1}}}]'
                else
                    echo "** BUILD IS FAILED ** Health check returned non 200 status code"
                    curl -I http://${EC2_INSTANCE_IP_SERVER2}/
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
                sh """/usr/local/bin/aws elbv2 modify-listener --listener-arn ${listenerARN} --default-actions '[{\"Type\": \"forward\",\"Order\": 1,\"ForwardConfig\": {\"TargetGroups\": [{\"TargetGroupArn\": \"${server1}\", \"Weight\": 1 },{\"TargetGroupArn\": \"${server2}\", \"Weight\": 1 }],\"TargetGroupStickinessConfig\": {\"Enabled\": true,\"DurationSeconds\": 1}}}]'"""
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
                sshagent(credentials: [EC2_INSTANCE_IP_SERVER1]) {
                  sh """
                  ssh -o StrictHostKeyChecking=no ubuntu@${EC2_INSTANCE_IP_SERVER1} "
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
                if [ "\$(curl -o /dev/null -s -I -w '%{http_code}' http://${EC2_INSTANCE_IP_SERVER1}/)" -eq 200 ]
                then
                    echo "** BUILD IS SUCCESSFUL **"
                    curl -I http://${EC2_INSTANCE_IP_SERVER1}/
                    /usr/local/bin/aws elbv2 modify-listener --listener-arn ${listenerARN} --default-actions '[{\"Type\": \"forward\",\"Order\": 1,\"ForwardConfig\": {\"TargetGroups\": [{\"TargetGroupArn\": \"${server1}\", \"Weight\": 1 },{\"TargetGroupArn\": \"${server2}\", \"Weight\": 1 }],\"TargetGroupStickinessConfig\": {\"Enabled\": true,\"DurationSeconds\": 1}}}]'
                else
                    echo "** BUILD IS FAILED ** Health check returned non 200 status code"
                    curl -I http://${EC2_INSTANCE_IP_SERVER1}/
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