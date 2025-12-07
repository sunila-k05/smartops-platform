pipeline {
    agent any

    environment {
        // DockerHub
        DOCKERHUB_USER = 'sunilak05'
        DOCKERHUB_PASS = credentials('dockerhub-pass')

        // Images
        BACKEND_IMAGE  = "sunilak05/smartops-backend"
        FRONTEND_IMAGE = "sunilak05/smartops-frontend"

        // GitOps repo
        GITOPS_REPO   = "git@github.com:sunila-k05/smartops-gitops.git"
        GITOPS_BRANCH = "main"
    }

    stages {

        /* =====================================
                     CHECKOUT
        ===================================== */
        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        /* =====================================
                     UNIT TESTS
        ===================================== */
        stage('Unit Tests (Backend)') {
            steps {
                sh '''
                cd backend
                npm install
                npm test || true
                '''
            }
        }

        /* =====================================
              BUILD BACKEND IMAGE
        ===================================== */
        stage('Build Backend Image') {
            steps {
                sh '''
                cd backend
                docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .
                '''
            }
        }

        /* =====================================
              BUILD FRONTEND IMAGE
        ===================================== */
        stage('Build Frontend Image') {
            steps {
                sh '''
                cd frontend
                docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} .
                '''
            }
        }

        /* =====================================
                      DOCKER LOGIN
        ===================================== */
        stage('Docker Login') {
            steps {
                sh '''
                echo ${DOCKERHUB_PASS} | docker login -u ${DOCKERHUB_USER} --password-stdin
                '''
            }
        }

        /* =====================================
                     PUSH IMAGES
        ===================================== */
        stage('Push Images to DockerHub') {
            steps {
                sh '''
                docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        /* =====================================
                UPDATE GITOPS REPO
        ===================================== */
        stage('Update GitOps Repo') {
            steps {
                sshagent(['github']) {    // <- FIXED CREDENTIAL ID
                    sh '''
                    # Ensure SSH known_hosts is ready
                    mkdir -p ~/.ssh
                    ssh-keyscan github.com >> ~/.ssh/known_hosts

                    # Clone repo fresh
                    rm -rf gitops
                    git clone ${GITOPS_REPO} gitops
                    cd gitops

                    # Update image tags in manifests
                    sed -i "s|image:.*smartops-backend.*|image: ${BACKEND_IMAGE}:${BUILD_NUMBER}|g" backend/deployment.yaml
                    sed -i "s|image:.*smartops-frontend.*|image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}|g" frontend/deployment.yaml

                    # Commit & push changes
                    git config user.email "jenkins@smartops.com"
                    git config user.name "Jenkins"

                    git add .
                    git commit -m "Update images to build ${BUILD_NUMBER}" || true
                    git push origin ${GITOPS_BRANCH}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✔ PIPELINE SUCCESS — GitOps updated. ArgoCD will sync automatically."
        }
        failure {
            echo "✘ PIPELINE FAILED — Check logs for details."
        }
    }
}
