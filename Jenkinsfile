pipeline {
    agent any

    environment {
        // DockerHub Credentials
        DOCKERHUB_USER = credentials('dockerhub-user')
        DOCKERHUB_PASS = credentials('dockerhub-pass')

        // Image Names
        BACKEND_IMAGE  = "sunilak05/smartops-backend"
        FRONTEND_IMAGE = "sunilak05/smartops-frontend"

        // GitOps Repo
        GITOPS_REPO = "git@github.com:sunila-k05/smartops-gitops.git"
        GITOPS_BRANCH = "main"
    }

    stages {

        /* ============================
           CHECKOUT
        ============================= */
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        /* ============================
           INSTALL DEPENDENCIES + TEST
        ============================= */
        stage('Run Unit Tests') {
            steps {
                sh """
                cd backend
                npm install
                npm test || true
                """
            }
        }

        /* ============================
           DOCKER BUILD BACKEND
        ============================= */
        stage('Build Backend Docker Image') {
            steps {
                sh """
                cd backend
                docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .
                """
            }
        }

        /* ============================
           DOCKER BUILD FRONTEND
        ============================= */
        stage('Build Frontend Docker Image') {
            steps {
                sh """
                cd frontend
                docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} .
                """
            }
        }

        /* ============================
           TRIVY SCAN (OPTIONAL)
        ============================= */
        stage('Trivy Security Scan') {
            steps {
                sh """
                trivy image ${BACKEND_IMAGE}:${BUILD_NUMBER} || true
                trivy image ${FRONTEND_IMAGE}:${BUILD_NUMBER} || true
                """
            }
        }

        /* ============================
           PUSH IMAGES TO DOCKERHUB
        ============================= */
        stage('Push Docker Images') {
            steps {
                sh """
                echo ${DOCKERHUB_PASS} | docker login -u ${DOCKERHUB_USER} --password-stdin

                docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                """
            }
        }

        /* ============================
           UPDATE GITOPS REPO
        ============================= */
        stage('Update GitOps Repo (Image Tags)') {
            steps {
                sshagent(['github']) {

                    sh """
                    # Clone the GitOps repo
                    rm -rf gitops
                    git clone ${GITOPS_REPO} gitops
                    cd gitops

                    echo "Updating backend image tag..."
                    sed -i "s|image: .*backend.*|image: ${BACKEND_IMAGE}:${BUILD_NUMBER}|g" backend/deployment.yaml

                    echo "Updating frontend image tag..."
                    sed -i "s|image: .*frontend.*|image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}|g" frontend/deployment.yaml

                    git config user.email "jenkins@smartops.com"
                    git config user.name "Jenkins"

                    git add .
                    git commit -m "Update images to build ${BUILD_NUMBER}"
                    git push origin ${GITOPS_BRANCH}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "CI/CD Completed Successfully! ArgoCD will now deploy automatically."
        }
        failure {
            echo "Pipeline Failed"
        }
    }
}
