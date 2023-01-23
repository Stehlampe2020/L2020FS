class L2020FS {
    #fsobject={};
    constructor() {
        
    }
    
    get json() {
        return JSON.stringify(this.#fsobject);
    }
    set json(string) {
        return this.#fsobject = JSON.parse(string);
    }
    
    readfile(path) {
        // Return the contents of this file in location path
    }
    writefile(path, content) {
        // Write content to the file on location path
    }
    
    fileprops(path) {
        // return the properties of the file in location path
    }
    setfileprops(path, props={}) {
        // Set all specified properties of the file in location path to te specified values, leave all others untouched.
    }
}
