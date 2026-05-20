pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                git 'https://github.com/Vittalgb-05/NextCart.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Dependency Check') {
            steps {
                bat 'npm audit'
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
}