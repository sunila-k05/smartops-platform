pipeline {
    agent any

    environment {
        // -----------------------------
        // DockerHub Credentials
        // -----------------------------
        DOCKERHUB_USER = 'sunilak05'
        DOCKERHUB_PASS = credentials('dockerhub-pass')

        // -----------------------------
        // Image names
        // -----------------------------
        BACKEND_IMAGE  = "sunilak05/smartops-backend"
        FRONTEND_IMAGE = "sunilak05/smartops-frontend"

        // -----------------------------
        // GitOps Repo
        // -----------------------------
        GITOPS_REPO = "git@github.com:sunila-k05/smartops-gitops.git"
        GITOPS_BRANCH = "main"
    }

    stages {

        /* =====================================
                     CHECKOUT SOURCE
        ===================================== */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* =====================================
                     UNIT TESTS (Backend)
        ===================================== */
        stage('Unit Tests') {
            steps {
                sh """
                cd backend
                npm install
                npm test || true
                """
            }
        }

        /* =====================================
                   BUILD BACKEND IMAGE
        ===================================== */
        stage('Build Backend Image') {
            steps {
                sh """
                cd backend
                docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .
                """
            }
        }

        /* =====================================
                   BUILD FRONTEND IMAGE
        ===================================== */
        stage('Build Frontend Image') {
            steps {
                sh """
                cd frontend
                docker build -t ${ FRONTEND_IMAGE }:${BUILD_NUMBER} .
                """
            }
        }

        /* =====================================
                      DOCKER LOGIN
        ===================================== */
        stage('Docker Login') {
            steps {
                sh """
                echo ${DOCKERHUB_PASS} | docker login -u ${DOCKERHUB_USER} --password-stdin
                """
            }
        }

        /* =====================================
                     PUSH IMAGES
        ===================================== */
        stage('Push Images') {
            steps {
                sh """
                docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                """
            }
        }

        /* =====================================
                UPDATE GITOPS (MANIFESTS)
        ===================================== */
        stage('Update GitOps Repo') {
            steps {
                sshagent(['github']) {
                    sh """
                    rm -rf gitops
                    git clone ${GITOPS_REPO} gitops
                    cd gitops

                    echo "Updating backend image tag..."
                    sed -i "s|image:.*smartops-backend.*|image: ${BACKEND_IMAGE}:${BUILD_NUMBER}|g" backend/deployment.yaml

                    echo "Updating frontend image tag..."
                    sed -i "s|image:.*smartops-frontend.*|image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}|g" frontend/deployment.yaml

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
            echo "PIPELINE SUCCESS — GitOps updated, ArgoCD will deploy automatically."
        }
        failure {
            echo "PIPELINE FAILED"
        }
    }
}
