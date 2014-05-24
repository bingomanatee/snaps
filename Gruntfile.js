module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            base: {
                files: {
                    'build/snaps.js': [
                        'src/index.js',
                        'src/assert.js',
                        'src/Rel.js',
                        'src/Observer.js',
                        'src/rate.js',
                        'src/Snap.js',
                        'src/Space.js']
                }
            }
        },
        umd: {
            fork: {
                src: 'build/snaps.js',
                dest: 'snaps.js', // optional, if missing the src will be used
              //  template: 'unit', // optional; a template from templates subdir can be specified by name (e.g. 'umd');
                // if missing the templates/umd.hbs file will be used
                objectToExport: 'SNAPS', // optional, internal object that will be exported
                amdModuleId: 'SNAPS', // optional, if missing the AMD module will be anonymous
                globalAlias: 'SNAPS', // optional, changes the name of the global variable
                deps: { // optional
                    'default': ['_', 'signals'],
                    cjs: ['lodash', 'signals']
                }
            }
        }

    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-umd');

// the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', ['concat:base', 'umd:fork']);
};
