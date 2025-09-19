pipeline {
    agent any

    environment {
        IMAGE_NAME = 'why48382/phanes-front-k8s'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    tools {
        nodejs 'NodeJS-24'
    }

    stages {
        stage('Git Clone') {
            steps {
                echo 'Cloning Repository'
                git branch: 'main', url: 'https://github.com/why48382/PhanesEditor_Front'
            }
        }

        stage('npm build') {
            steps {
                sh 'npm i'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                }
            }
        }
        stage('Push to Registry') {
            steps {
                script {
                    withDockerRegistry([credentialsId: 'docker_hub_credentail']) {
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push()
                    }
                }
            }
        }
        stage('Generate Deployment YAML') {
            steps {
                script {
                    sh """
                    cat > deployment.yaml <<EOF
        apiVersion: apps/v1
        kind: Deployment
        metadata:
        name: phanes-front-deployment-${BUILD_NUMBER}
        namespace: lhs
        spec:
        selector:
            matchLabels:
            type: front
            ver: ${BUILD_NUMBER}
        replicas: 1
        strategy:
            type: RollingUpdate
        template:
            metadata:
            labels:
                type: front
                ver: ${BUILD_NUMBER}
            spec:
            containers:
            - name: container
                image: ${IMAGE_NAME}:${IMAGE_TAG}
                ports:
                - containerPort: 80
                livenessProbe:
                httpGet:
                    path: /health
                    port: 80
                initialDelaySeconds: 20
                periodSeconds: 10
                readinessProbe:
                httpGet:
                    path: /test
                    port: 80
                initialDelaySeconds: 20
                periodSeconds: 10
                successThreshold: 3
            terminationGracePeriodSeconds: 30
        EOF
                    """
                }
            }
        }
        stage('Deploy via SSH') {
            steps {
                script {
                    sshPublisher(
                        publishers: [
                            sshPublisherDesc(
                                configName: 'K8S_Master',
                                transfers: [
                                    sshTransfer(
                                        sourceFiles: 'deployment.yaml',
                                        remoteDirectory: '/tmp',
                                        execCommand: '''
                                        kubectl apply -f /tmp/deployment.yaml
                                        kubectl rollout status -n lhs deployment/phanes-front-deployment-${BUILD_NUMBER}
                                        '''
                                    )
                                ]
                            )
                        ]
                    )
                }
            }
        }
    }
}
