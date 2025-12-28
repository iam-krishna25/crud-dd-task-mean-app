pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        // Docker Hub images
        FRONTEND_IMAGE = "shiva425/mean-frontend"
        BACKEND_IMAGE  = "shiva425/mean-backend"

        // EC2 details
        AWS_USER = "ubuntu"
        AWS_IP   = "54.87.36.97"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/iam-krishna25/crud-dd-task-mean-app.git'

                script {
                    IMAGE_TAG = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }

                echo "Using image tag: ${IMAGE_TAG}"
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        stage('Build & Push Backend Image') {
            steps {
                sh """
                cd backend
                docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
                docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                docker push ${BACKEND_IMAGE}:latest
                """
            }
        }

        stage('Build & Push Frontend Image') {
            steps {
                sh """
                cd frontend
                docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                docker push ${FRONTEND_IMAGE}:latest
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'aws-ssh-key',
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {
                    sh """
                    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${AWS_USER}@${AWS_IP} '
                        set -e
                        cd /home/ubuntu/crud-dd-task-mean-app

                        sed -i "s|${FRONTEND_IMAGE}:.*|${FRONTEND_IMAGE}:${IMAGE_TAG}|" docker-compose.yaml
                        sed -i "s|${BACKEND_IMAGE}:.*|${BACKEND_IMAGE}:${IMAGE_TAG}|" docker-compose.yaml

                        docker compose pull
                        docker compose down || true
                        docker compose up -d
                    '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline completed successfully"
        }
        failure {
            echo "❌ CI/CD Pipeline failed"
        }
    }
}




