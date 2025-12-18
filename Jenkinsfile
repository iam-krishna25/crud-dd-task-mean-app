pipeline {
    agent any

    triggers {
        githubPush()
    }

    tools {
        nodejs 'node18'
    }

    environment {
        // Docker Hub images
        FRONTEND_IMAGE = "shiva425/mean-frontend"
        BACKEND_IMAGE  = "shiva425/mean-backend"

        // EC2 details
        AWS_USER = "ubuntu"
        AWS_IP   = "54.172.37.246"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/iam-krishna25/crud-dd-task-mean-app.git'

                script {
                    env.IMAGE_TAG = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }

                echo "Docker image tag: ${IMAGE_TAG}"
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                cd backend
                docker buildx build \
                    --platform linux/amd64 \
                    -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                    -t ${BACKEND_IMAGE}:latest \
                    --push .
                """
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                cd frontend
                docker buildx build \
                    --platform linux/amd64 \
                    -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                    -t ${FRONTEND_IMAGE}:latest \
                    --push .
                '''
            }
        }

        stage('Deploy to EC2 VM') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'aws-ssh-key',
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {
                    sh '''
                        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${AWS_USER}@${AWS_IP} '
                            set -e
                            cd /home/ubuntu/crud-dd-task-mean-app

                            sed -i "s|${FRONTEND_IMAGE}:.*|${FRONTEND_IMAGE}:${IMAGE_TAG}|" docker-compose.yaml
                            sed -i "s|${BACKEND_IMAGE}:.*|${BACKEND_IMAGE}:${IMAGE_TAG}|" docker-compose.yaml
                            
                            docker compose pull
                            docker compose down
                            docker compose up -d
                        '
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "CI/CD Pipeline completed successfully"
        }
        failure {
            echo " CI/CD Pipeline failed"
        }
    }
}
