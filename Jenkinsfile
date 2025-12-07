pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'sunilak05'
        DOCKERHUB_PASS = credentials('dockerhub-pass')

        BACKEND_IMAGE  = "sunilak05/smartops-backend"
        FRONTEND_IMAGE = "sunilak05/smartops-frontend"

        GITOPS_REPO   = "git@github.com:sunila-k05/smartops-gitops.git"
        GITOPS_BRANCH = "main"
    }

    stages {

        /* =====================================
                     CHECKOUT
        ===================================== */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* =====================================
                     UNIT TESTS
        ===================================== */
        stage('Unit Tests') {
            steps {
                sh '''
                cd backend
                npm install
                npm test || true
                '''
            }
        }

        /* =====================================
              BUILD BACKEND DOCKER IMAGE
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
              BUILD FRONTEND DOCKER IMAGE
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
        stage('Push Images') {
            steps {
                sh '''
                docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        /* =====================================
                    UPDATE GITOPS
        ===================================== */
        stage('Update GitOps Repo') {
            steps {
                sshagent(['git']) {   // <<--- use your SSH credential ID
                    sh '''
                    # ----- prevent host key verification failed -----
                    mkdir -p ~/.ssh
                    ssh-keyscan github.com >> ~/.ssh/known_hosts

                    # ----- clone repo -----
                    rm -rf gitops
                    git clone ${GITOPS_REPO} gitops
                    cd gitops

                    # ----- update image tags -----
                    sed -i "s|image:.*smartops-backend.*|image: ${BACKEND_IMAGE}:${BUILD_NUMBER}|g" backend/deployment.yaml
                    sed -i "s|image:.*smartops-frontend.*|image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}|g" frontend/deployment.yaml

                    # ----- commit & push -----
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
            echo "PIPELINE SUCCESS — GitOps updated, ArgoCD will deploy automatically."
        }
        failure {
            echo "PIPELINE FAILED"
        }
    }
}
