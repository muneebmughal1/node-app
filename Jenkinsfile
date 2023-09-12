pipeline {
    agent any
    
    environment {
        // Define your SSH credentials
        SSH_CREDENTIALS = credentials('15.222.239.203')
        EC2_INSTANCE_IP = '15.222.239.203'
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                // Checkout your Node.js application code from your version control system (e.g., Git)
                checkout scm
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    // Copy your Node.js application code to the EC2 instance
                    sshagent(credentials: [SSH_CREDENTIALS]) {
                        sh "scp -i /var/lib/jenkins/secrets/15.222.239.203 -r * ubuntu@${EC2_INSTANCE_IP}:/sample"
                    }
                    
                    // Connect to the EC2 instance and perform deployment steps
                    sshagent(credentials: [SSH_CREDENTIALS]) {
                        sh "ssh -i /var/lib/jenkins/secrets/15.222.239.203 ubuntu@${EC2_INSTANCE_IP} 'cd /sample && npm install && pm2 restart test'"
                    }
                }
            }
        }
    }
}
