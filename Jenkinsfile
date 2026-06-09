pipeline {
    agent any

    stages {

        stage('Show Workspace') {
            steps {
                bat 'dir'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Dependency Check') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    bat 'npm audit'
                }
            }
        }

        stage('Verify Environment') {
            steps {
                bat 'if exist .env (echo .env found) else (echo .env NOT found)'
            }
        }

        stage('Build Next.js App') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t nextcart .'
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed'
        }

        success {
            echo 'Build Successful'
        }

        unstable {
            echo 'Dependency vulnerabilities found'
        }

        failure {
            echo 'Pipeline Failed'
        }
    }
}