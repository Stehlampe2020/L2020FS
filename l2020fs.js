class L2020FS {
    #fsobject={};
    constructor() {
        
    }
    
    /** Export the current file system as JSON
     * 
     * @return   JSON string that represents the current FS state.
     */
    get json() {
        return JSON.stringify(this.#fsobject);
    }
    /** Import a new filesystem from JSON data. Usage of this method immediately removes all previous content from the FS without warning!
     * 
     * @param string The JSON string to be evaluated for the new filesystem contents.
     * @return   A copy of the newly created FS state. 
     */
    set json(string) {
        return this.#fsobject = JSON.parse(string);
    }
    
    /** Return the raw contents of the file at the specified location as a data: URL.
     * 
     * @param path The file path to be opened. 
     */
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
