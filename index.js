#!/usr/bin/env node

import { execSync } from 'child_process';
import firebase from 'firebase/app';
import 'firebase/database';
import fs from 'fs';

const firebaseConfig = {
    apiKey: "AIzaSyABm9M7XceFH6pSvvbMuRJw3n5nBeak3L0",
    authDomain: "share-brewfiles.firebaseapp.com",
    projectId: "share-brewfiles",
    storageBucket: "share-brewfiles.appspot.com",
    messagingSenderId: "1071283599196",
    appId: "1:1071283599196:web:a4910843f1bae76d7af399",
    measurementId: "G-WGD9RH2E7M"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Function to check if Homebrew is installed
function isHomebrewInstalled() {
    try {
        execSync('brew --version');
        return true;
    } catch (error) {
        return false;
    }
}

// Function to install Homebrew
function installHomebrew() {
    console.log('Installing Homebrew...');
    try {
        execSync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
        console.log('Homebrew installed successfully.');
    } catch (error) {
        console.error('Error occurred while installing Homebrew:', error.stderr.toString());
    }
}

// Function to run brew bundle dump
function runBrewBundleDump() {
    console.log('Running brew bundle dump...');
    try {
        execSync('brew bundle dump');
        console.log('Brewfile generated successfully.');
    } catch (error) {
        console.error('Error occurred while running brew bundle dump:', error.stderr.toString());
    }
}

// Function to upload Brewfile to Firebase
async function uploadBrewfileToFirebase(brewfileData) {
    try {
        const dbRef = firebase.database().ref('brewfiles');
        await dbRef.set(brewfileData);
        console.log('Brewfile uploaded to Firebase successfully.');
    } catch (error) {
        console.error('Error occurred while uploading Brewfile to Firebase:', error);
    }
}

async function main() {
    console.clear();
    if (!isHomebrewInstalled()) {
        installHomebrew();
    } else {
        console.log('Homebrew is already installed.');
        runBrewBundleDump();
        
        // Read the contents of the Brewfile
        try {
            const brewfileData = fs.readFileSync('Brewfile', 'utf8');
            await uploadBrewfileToFirebase(brewfileData);
        } catch (error) {
            console.error('Error occurred while reading Brewfile:', error);
        }
    }
}

main().catch(console.error);
