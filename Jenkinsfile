pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh 'rm -rf /var/www/html/*'
                sh 'cp -r frontend/dist/* /var/www/html/'
            }
        }
    }

    post {
        success {
            echo '🎉 Build and Deployment Successful!'
        }

        failure {
            echo '❌ Pipeline Failed!'
        }
    }
}