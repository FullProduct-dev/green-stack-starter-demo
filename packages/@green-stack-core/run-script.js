const { tsImport } = require('tsx/esm/api')
tsImport('./esbuild-setup.ts', __filename).then(() => {

    // Get the script to run
    const scriptToRun = process.argv[2]

    // Exit if no script provided
    if (!scriptToRun) {
        console.error('No script provided')
        process.exit(1)
    }

    // Include env vars from .env.local ?
    const fs = require('fs')
    const path = require('path')
    const dotenv = require('dotenv')
    const envPath = path.resolve(__dirname, '../../apps/next/.env.local')
    const envPathExists = fs.existsSync(envPath)
    if (envPathExists) dotenv.config({ path: envPath })

    // Run the script
    tsImport(scriptToRun, __filename)

})
