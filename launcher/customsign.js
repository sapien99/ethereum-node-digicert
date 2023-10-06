'use strict';

exports.default = async function(configuration) {    

    if(configuration.path){
    
      require("child_process").execSync(     
        `smctl sign --keypair-alias=${process.env.KEYPAIR_ALIAS} --input "${String(configuration.path)}"`
      );

    }
  };