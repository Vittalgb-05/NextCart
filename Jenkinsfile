pipeline {
    agent any

    tools {
        jdk 'JDK21'
    }

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

        stage('Check Java') {
            steps {
                bat 'java -version'
                bat 'echo JAVA_HOME=%JAVA_HOME%'
            }
        }

        stage('Code Quality Check') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {

                        bat """
                        ${scannerHome}\\bin\\sonar-scanner.bat ^
                        -Dsonar.projectKey=NextCart ^
                        -Dsonar.projectName=NextCart ^
                        -Dsonar.sources=. ^
                        -Dsonar.sourceEncoding=UTF-8
                        """
                    }
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