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
            // Store the PEM key content in a variable
            def pemKey = credentials('15.222.239.203')
            
            // Use the PEM key content directly in the ssh command
            sshagent(credentials: [SSH_CREDENTIALS]) {
                sh """
                ssh -i - ec2-user@${EC2_INSTANCE_IP} <<EOF
                $(echo $pemKey | sed 's/^/echo /')
                cd /sample
                npm install
                pm2 restart test
                EOF
                """
            }
        }
    }
}

    }
}
