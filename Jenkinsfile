pipeline {
  agent any
  parameters {
    choice (name: 'chooseNode', choices: ['Green', 'Blue'], description: 'Choose which Environment to Deploy: ')
  }
  environment {
    listenerARN = 'arn:aws:elasticloadbalancing:ca-central-1:989848885966:loadbalancer/app/blue-green/d19e5f138089f55d'
    blueARN = 'arn:aws:elasticloadbalancing:ca-central-1:989848885966:targetgroup/blue/0df8b322ca5bcb8c'
    greenARN = 'arn:aws:elasticloadbalancing:ca-central-1:989848885966:targetgroup/green/0bb75d3946b71336'
    SSH_CREDENTIALS_GREEN = credentials('15.222.239.203')
    EC2_INSTANCE_IP_GREEN = '15.222.239.203'
    SSH_CREDENTIALS_BLUE = credentials('35.183.46.136')
    EC2_INSTANCE_IP_BLUE = '35.183.46.136'

  }
  stages {
    stage('Deployment Started') {
      parallel {
        stage('Green') {
          when {
            expression {
              params.chooseNode == 'Green'
            }
          }
          stages {
            stage('Offloading Green') {
              steps {
                sh """/usr/local/bin/aws elbv2 modify-listener  listener-arn ${listenerARN}  default-actions '[{"Type": "forward","Order": 1,"ForwardConfig": {"TargetGroups": [{"TargetGroupArn": "${greenARN}", "Weight": 0 },{"TargetGroupArn": "${blueARN}", "Weight": 1 }],"TargetGroupStickinessConfig": {"Enabled": true,"DurationSeconds": 1}}}]'"""
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
                sshagent(credentials: ['15.222.239.203']) {
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
            stage('Validate and Add Green for testing') {
              steps {
                sh """
                if [ "\$(curl -o /dev/null – silent – head – write-out '%{http_code}' http://${EC2_INSTANCE_IP_GREEN}/)" -eq 200 ]
                then
                    echo "** BUILD IS SUCCESSFUL **"
                    curl -I http:///${EC2_INSTANCE_IP_GREEN}/
                    /usr/local/bin/aws elbv2 modify-listener – listener-arn ${listenerARN} – default-actions '[{"Type": "forward","Order": 1,"ForwardConfig": {"TargetGroups": [{"TargetGroupArn": "${greenARN}", "Weight": 0 },{"TargetGroupArn": "${blueARN}", "Weight": 1 }],"TargetGroupStickinessConfig": {"Enabled": true,"DurationSeconds": 1}}}]'
                else
                    echo "** BUILD IS FAILED ** Health check returned non 200 status code"
                    curl -I http://${EC2_INSTANCE_IP_GREEN}/
                exit 2
                fi
                """
              }
            }
          }
        }
        stage('Blue') {
          when {
            expression {
              params.chooseNode == 'Blue'
            }
          }
          stages {
            stage('Offloading Blue') {
              steps {
                sh """/usr/local/bin/aws elbv2 modify-listener – listener-arn ${listenerARN} – default-actions '[{"Type": "forward","Order": 1,"ForwardConfig": {"TargetGroups": [{"TargetGroupArn": "${greenARN}", "Weight": 1 },{"TargetGroupArn": "${blueARN}", "Weight": 0 }],"TargetGroupStickinessConfig": {"Enabled": true,"DurationSeconds": 1}}}]'"""
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
                sshagent(credentials: ['35.183.46.136']) {
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
            stage('Validate Blue and added to TG') {
              steps {
                sh """
                if [ "\$(curl -o /dev/null – silent – head – write-out '%{http_code}' http://${EC2_INSTANCE_IP_BLUE}/)" -eq 200 ]
                then
                    echo "** BUILD IS SUCCESSFUL **"
                    curl -I http://${EC2_INSTANCE_IP_BLUE}/
                    /usr/local/bin/aws elbv2 modify-listener – listener-arn ${listenerARN} – default-actions '[{"Type": "forward","Order": 1,"ForwardConfig": {"TargetGroups": [{"TargetGroupArn": "${greenARN}", "Weight": 1 },{"TargetGroupArn": "${blueARN}", "Weight": 1 }],"TargetGroupStickinessConfig": {"Enabled": true,"DurationSeconds": 1}}}]'
                else
                    echo "** BUILD IS FAILED ** Health check returned non 200 status code"
                    curl -I http://${EC2_INSTANCE_IP_BLUE}/
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