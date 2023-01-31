/*
Example filesystem structure:
filesystem = {
    "testfolder":{
        "some file with spaces in its name":"data:text/html;base64,PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImRlIj4KICAgIDxoZWFkPgogICAgICAgIDxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KICAgICAgICA8dGl0bGU+ZGF0YTotVVJMLUdlbmVyYXRvcjwvdGl0bGU+CiAgICAgICAgPHNjcmlwdD4KICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHsgICAgCiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2VuZXJhdGUtYnV0dG9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHsKICAgICAgICAgICAgICAgICAgICB2YXIgZmlsZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZScpLmZpbGVzOwogICAgICAgICAgICAgICAgICAgIGZvciAoZmlsZSBvZiBmaWxlcykgewogICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZUJhc2U2NChmaWxlKTsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgfSk7CgogICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZUJhc2U2NChmaWxlKSB7CiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2VuZXJhdGUtYnV0dG9uJykuZGlzYWJsZWQgPSB0cnVlOwogICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1dHRvbi1sYWJlbCcpLmhpZGRlbiA9IHRydWU7CiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGFkZWFuaW1hdGlvbicpLmhpZGRlbiA9IGZhbHNlOwogICAgICAgICAgICAgICAgdmFyIGZpbGVuYW1lID0gZmlsZS5uYW1lOwogICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7CiAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTsKICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7CiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2RhdGE6LVVSTCB2b24gWycgKyBmaWxlbmFtZSArICJdOiAiLCByZWFkZXIucmVzdWx0KQogICAgICAgICAgICAgICAgICAgIGRhdGF1cmxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RhdGF1cmxzJyk7CiAgICAgICAgICAgICAgICAgICAgZGF0YXVybHMuaW5uZXJIVE1MID0gZGF0YXVybHMuaW5uZXJIVE1MICsgIjxicj48ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O1wiIHRpdGxlPVwiIiArIGZpbGVuYW1lICsgIlwiPjxhIGhyZWY9XCIiICsgcmVhZGVyLnJlc3VsdCArICJcIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOmdyZWVuO1wiIGRvd25sb2FkPVwiIiArIGZpbGVuYW1lICsgIlwiPiIgKyBmaWxlbmFtZSArICI8L2E+fDxidXR0b24gb25jbGljaz1cIm5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KCciICsgcmVhZGVyLnJlc3VsdCArICInKTsgYWxlcnQoJ2RhdGE6LVVSTCBmw7xyIFsiICsgZmlsZW5hbWUgKyAiXSBrb3BpZXJ0IScpXCI+S29waWVyZW48L2J1dHRvbj4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgc3R5bGU9XCJmbGV4OjFcIiByZWFkb25seSB2YWx1ZT1cIiIgKyByZWFkZXIucmVzdWx0ICsgIlwiPC9pbnB1dD48L2Rpdj4iOwogICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidXR0b24tbGFiZWwnKS5oaWRkZW4gPSBmYWxzZTsKICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGFkZWFuaW1hdGlvbicpLmhpZGRlbiA9IHRydWU7CiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dlbmVyYXRlLWJ1dHRvbicpLmRpc2FibGVkID0gZmFsc2U7CiAgICAgICAgICAgICAgICB9OwogICAgICAgICAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHsKICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCJkYXRhOi1VUkwgdm9uIFsiICsgZmlsZW5hbWUgKyAiXSBrb25udGUgbmljaHQgZ2VuZXJpZXJ0IHdlcmRlbjoiLCBlcnJvcik7CiAgICAgICAgICAgICAgICAgICAgZGF0YXVybHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGF0YXVybHMnKTsKICAgICAgICAgICAgICAgICAgICBkYXRhdXJscy5pbm5lckhUTUwgPSBkYXRhdXJscy5pbm5lckhUTUwgKyAiPGJyPjxkaXYgc3R5bGU9XCJjb2xvcjpibGFjaztiYWNrZ3JvdW5kLWNvbG9yOnJlZDt3aGl0ZS1zcGFjZTpub3dyYXA7XCI+IiArIGZpbGVuYW1lICsgIjwvZGl2PiI7CiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1dHRvbi1sYWJlbCcpLmhpZGRlbiA9IGZhbHNlOwogICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYWRlYW5pbWF0aW9uJykuaGlkZGVuID0gdHJ1ZTsKICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2VuZXJhdGUtYnV0dG9uJykuZGlzYWJsZWQgPSBmYWxzZTsKICAgICAgICAgICAgICAgIH07CiAgICAgICAgICAgIH0KICAgICAgICA8L3NjcmlwdD4KICAgIDwvaGVhZD4KICAgIDxib2R5IHN0eWxlPSJjb2xvcjpibGFjaztiYWNrZ3JvdW5kLWNvbG9yOmxpZ2h0Ymx1ZSI+CiAgICAgICAgRGF0ZWkgYXVzd8OkaGxlbiB1bmQgImRhdGE6LVVSTCBiZXJlY2huZW4iIGFua2xpY2tlbjo8YnI+CiAgICAgICAgPHNwYW4gc3R5bGU9ImNvbG9yOnJlZDsiPkFDSFRVTkc6IFdlbm4gZGllIGhvY2hnZWxhZGVuZSBEYXRlaSBncsO2w59lciBhbHMgZGVyIGZyZWllIEFyYmVpdHNwZWljaGVycGxhdHogaXN0LCBrYW5uIGRpZXMgenVtIEFic3R1cnogZGVzIEJyb3dzZXJzL0dlcsOkdGVzIGbDvGhyZW4hPC9zcGFuPgogICAgICAgIDxicj4KICAgICAgICA8YnI+CiAgICAgICAgPGlucHV0IGlkPSJmaWxlIiB0eXBlPSJmaWxlIi8+CiAgICAgICAgPGJyPgogICAgICAgIDxicj4KICAgICAgICA8YnV0dG9uIGlkPSJnZW5lcmF0ZS1idXR0b24iPjxpbWcgc3JjPSIvYXNzZXRzL2xvYWRlci5naWYiIGlkPSJsYWRlYW5pbWF0aW9uIiBzdHlsZT0icG9pbnRlci1ldmVudHM6bm9uZTsiIGhpZGRlbj48c3BhbiBpZD0iYnV0dG9uLWxhYmVsIj5kYXRhOi1VUkwgYmVyZWNobmVuPC9zcGFuPjwvYnV0dG9uPgogICAgICAgIDxkaXYgaWQ9ImRhdGF1cmxzIj48L2Rpdj4KICAgIDwvYm9keT4KPC9odG1sPgo=",
        "some file with spaces in its name.l2020fsprops":"data:application/json,{%22prop1%22%3A%22some%20property%20of%20the%20file%20%27some%20file%20with%20spaces%20in%20its%20name%27%22}"
    },
    "Some_other_file":"data:text/plain,This%20is%20an%20unencoded%20file.",
    "Some_other_file.l2020fsprops":"data:application/json,{%22prop1%22%3A%22some%20property%20of%20the%20file%20%27Some_other_name%27%22}"
}

The special `${filename}.l2020fsprops` files are hidden and contain special properties to the file with the name before .l2020fsprops, like for example who can access them or metadata other than the type and encoding.
*/

class L2020FS {
    #fsobject={};
    constructor() {
        
    }
    
    listdir(path) {
        
    }
    
    fileref(path) {
        locationref = this.#fsobject;
        for (dir of path.split('/')) {
            if (dir) {
                locationref = locationref[dir]; // step into the next directory
            } else {
                // Do nothing because several slashes together should be interpreted as one.
            }
        }
        return locationref;
    }
    
    /** Export the current file system as JSON
     * 
     * @return {String} - JSON string that represents the current FS state.
     */
    get json() {
        return JSON.stringify(this.#fsobject);
    }
    /** Import a new filesystem from JSON data. Usage of this method immediately removes all previous content from the FS without warning!
     * 
     * @param {String} string - The JSON string to be evaluated for the new filesystem contents.
     * @return {Object} - A copy of the newly created FS state. 
     */
    set json(string) {
        return this.#fsobject = JSON.parse(string);
    }
    
    /** Return the raw contents of the file at the specified location as a data: URL.
     * 
     * @param {String} path - The file path to be opened. 
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
