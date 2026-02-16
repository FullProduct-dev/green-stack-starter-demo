require('tsx/cjs')
const path = require('path')

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- Plopfile wrapper to load the TypeScript generator config via tsx.
// -i- Used by scripts/run-gen.ts for both interactive and --args modes.

/* --- Load generators ------------------------------------------------------------------------- */

const config = require(path.join(__dirname, '../turbo/generators/config.ts')).default

/* --- Exports --------------------------------------------------------------------------------- */

module.exports = config
