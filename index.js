import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

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

function isHomebrewInstalled() {
    try {
        execSync('brew --version');
        return true;
    } catch (error) {
        return false;
    }
}

function installHomebrew() {
    console.log('Installing Homebrew...');
    try {
        execSync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
        console.log('Homebrew installed successfully.');
    } catch (error) {
        console.error('Error occurred while installing Homebrew:', error.stderr.toString());
    }
}

function runBrewBundleDump() {
    console.log('Running brew bundle dump...');
    try {
        execSync('brew bundle dump');
        console.log('Brewfile generated successfully.');
    } catch (error) {
        console.error('Error occurred while running brew bundle dump:', error.stderr.toString());
    }
}

function readBrewfileData() {
    try {
        const brewfileData = readFileSync('Brewfile', 'utf-8');
        return brewfileData;
    } catch (error) {
        console.error('Error occurred while reading Brewfile:', error);
        return null;
    }
}

async function uploadBrewfileToFirebase(brewfileData) {
    try {
        const db = firebase.firestore();
        const collectionRef = db.collection('brewfiles');
        await collectionRef.add({ data: brewfileData });
        console.log('Brewfile uploaded to Firestore successfully.');
    } catch (error) {
        console.error('Error occurred while uploading Brewfile to Firestore:', error);
    }
}

async function parseBrewfile(brewfileData) {
    const packages = {};
    const lines = brewfileData.split('\n');
    
    lines.forEach((line, index) => {
        if (line.startsWith('tap')) {
            const [, name] = line.split(' ');
            packages[index + 1] = { name, packageManager: 'tap' };
        } else if (line.startsWith('brew')) {
            const [, name] = line.split(' ');
            packages[index + 1] = { name, packageManager: 'brew' };
        } else if (line.startsWith('vscode')) {
            const [, name] = line.split(' ');
            packages[index + 1] = { name, packageManager: 'vscode' };
        }
    });

    return packages;
}

async function main() {
    console.clear();
    if (!isHomebrewInstalled()) {
        installHomebrew();
    } else {
        console.log('Homebrew is already installed.');
        runBrewBundleDump();
        const brewfileData = readBrewfileData();
        if (brewfileData) {
            const packages = await parseBrewfile(brewfileData);
            console.log(packages);
            await uploadBrewfileToFirebase(packages);
        } else {
            console.error('No Brewfile data found.');
        }
    }
}

main().catch(console.error);
