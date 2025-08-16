const { execSync, spawn } = require('child_process');
const os = require('os');

console.log('🚀 Starting MySQL service...');

function detectOS() {
    const platform = os.platform();
    const arch = os.arch();
    
    console.log(`🔍 Detected OS: ${platform} (${arch})`);
    
    if (platform === 'darwin') {
        return 'macos';
    } else if (platform === 'win32') {
        return 'windows';
    } else if (platform === 'linux') {
        return 'linux';
    } else {
        return 'unknown';
    }
}

function startMySQL() {
    const osType = detectOS();
    
    try {
        if (osType === 'macos') {
            return startMySQLMacOS();
        } else if (osType === 'windows') {
            return startMySQLWindows();
        } else if (osType === 'linux') {
            return startMySQLLinux();
        } else {
            console.log(`❌ Unsupported operating system: ${os.platform()}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Error occurred while starting MySQL:', error.message);
        return false;
    }
}

function startMySQLMacOS() {
    console.log('🍎 Starting MySQL for macOS...');
    
    try {
        // Check if MySQL is already running
        try {
            execSync('mysql.server status', { stdio: 'pipe' });
            console.log('✅ MySQL is already running!');
            return true;
        } catch (e) {
            // MySQL is not running, try to start it without sudo first
            console.log('Starting MySQL...');
            
            try {
                // Try without sudo first (if user has permissions)
                execSync('mysql.server start', { stdio: 'pipe' });
                console.log('✅ MySQL started successfully without sudo!');
            } catch (e2) {
                console.log('⚠️ Non-sudo start failed, trying with sudo...');
                console.log('💡 If prompted for password, enter your system password');
                
                try {
                    // Use execSync with inherit for sudo password prompt
                    execSync('sudo mysql.server start', { stdio: 'inherit' });
                    console.log('✅ MySQL successfully started with sudo!');
                } catch (e3) {
                    console.log('❌ Failed to start MySQL on macOS:', e3.message);
                    console.log('🔧 Please check:');
                    console.log('   1. Is MySQL installed? (brew install mysql)');
                    console.log('   2. Are there permission issues?');
                    console.log('   3. Is port 3306 in use?');
                    console.log('   4. Try running: sudo mysql.server start manually');
                    return false;
                }
            }
            
            // Wait 3 seconds
            console.log('Checking MySQL status...');
            execSync('sleep 3', { stdio: 'pipe' });
            
            try {
                execSync('mysql.server status', { stdio: 'pipe' });
                console.log('✅ MySQL successfully started and is running!');
                return true;
            } catch (e) {
                console.log('⚠️ MySQL started but there is an issue with status check');
                return true; // Still return true as MySQL might be running
            }
        }
    } catch (error) {
        console.log('❌ Failed to start MySQL on macOS:', error.message);
        console.log('🔧 Please check:');
        console.log('   1. Is MySQL installed? (brew install mysql)');
        console.log('   2. Are there permission issues?');
        console.log('   3. Is port 3306 in use?');
        console.log('   4. Try running: sudo mysql.server start manually');
        return false;
    }
}

function startMySQLWindows() {
    console.log('🪟 Starting MySQL for Windows...');
    
    try {
        // Try to start MySQL service
        execSync('net start mysql', { stdio: 'inherit' });
        console.log('✅ MySQL successfully started!');
        return true;
    } catch (e) {
        console.log('❌ Failed to start MySQL on Windows!');
        console.log('🔧 Please check the following steps:');
        console.log('   1. Is MySQL installed?');
        console.log('   2. Are there permission issues? (Run as Administrator)');
        console.log('   3. Is port 3306 in use?');
        console.log('   4. Is MySQL service configured in Services?');
        return false;
    }
}

function startMySQLLinux() {
    console.log('🐧 Starting MySQL for Linux...');
    
    try {
        // Try systemctl first (modern Linux systems)
        try {
            execSync('sudo systemctl start mysql', { stdio: 'inherit' });
            console.log('✅ MySQL successfully started with systemctl!');
            return true;
        } catch (e) {
            console.log('⚠️ systemctl failed, trying service command...');
            
            // Try service command as alternative
            try {
                execSync('sudo service mysql start', { stdio: 'inherit' });
                console.log('✅ MySQL successfully started with service!');
                return true;
            } catch (e2) {
                console.log('❌ Failed to start MySQL on Linux!');
                console.log('🔧 Please check the following steps:');
                console.log('   1. Is MySQL installed? (sudo apt install mysql-server)');
                console.log('   2. Are there permission issues?');
                console.log('   3. Is port 3306 in use?');
                console.log('   4. Check MySQL logs: sudo tail -f /var/log/mysql/error.log');
                return false;
            }
        }
    } catch (error) {
        console.log('❌ Failed to start MySQL on Linux:', error.message);
        return false;
    }
}

// Main execution
console.log('🔄 Initializing MySQL startup process...');

if (startMySQL()) {
    console.log('🎉 MySQL startup process completed successfully!');
    process.exit(0);
} else {
    console.log('💥 MySQL startup process failed!');
    console.log('📋 Please review the error messages above and try again.');
    console.log('');
    console.log('🔧 Alternative solutions:');
    console.log('   1. Start MySQL manually: sudo mysql.server start');
    console.log('   2. Use no-MySQL start: npm run start:no-mysql');
    console.log('   3. Check if MySQL is installed: brew install mysql');
    console.log('   4. Check MySQL status: mysql.server status');
    process.exit(1);
} 