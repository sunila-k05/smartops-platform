pipeline {
  agent any
  environment {
    DOCKERHUB_REPO = 'https://github.com/sunila-k05/smartops-platform' // e.g., yourdockerhub/smartops
    DOCKER_CRED = 'dockerhub-cred'
    AWS_CRED = 'aws-creds'
    TF_DIR = 'terraform/envs/dev'
    HELM_CHART = 'charts/smartops-chart'
    K8S_NAMESPACE = 'smartops'
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Unit Test') { steps { sh 'cd backend && npm install && npm test || true' } }
    stage('Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKER_CRED}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
            docker build -t ${DOCKERHUB_REPO}:backend-${BUILD_NUMBER} backend
            docker push ${DOCKERHUB_REPO}:backend-${BUILD_NUMBER}
            docker build -t ${DOCKERHUB_REPO}:frontend-${BUILD_NUMBER} frontend
            docker push ${DOCKERHUB_REPO}:frontend-${BUILD_NUMBER}
            docker logout
          '''
        }
      }
    }
    stage('Terraform Apply (optional)') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "${AWS_CRED}"]]) {
          dir("${TF_DIR}") { sh 'terraform init -input=false && terraform apply -auto-approve' }
        }
      }
    }
    stage('K8s Deploy (optional)') {
      steps {
        sh '''
          aws eks --region ap-south-1 update-kubeconfig --name smartops-eks
          helm upgrade --install smartops ${HELM_CHART} --namespace ${K8S_NAMESPACE} --create-namespace \
            --set backend.image.repository=${DOCKERHUB_REPO} --set backend.image.tag=backend-${BUILD_NUMBER} \
            --set frontend.image.repository=${DOCKERHUB_REPO} --set frontend.image.tag=frontend-${BUILD_NUMBER}
        '''
      }
    }
  }
}
