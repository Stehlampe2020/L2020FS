/* 
* Note that this file calls the file system objects "inode"s, even though they technically aren't. 
*/
class L2FSError extends Error { // General file system error
   constructor(message) {
       super(message);
       this.name = 'L2FSError';
   }
}

class L2FSInodeNotFoundError extends L2FSError {
   constructor(path) {
       super(`Error opening '${path}' (no such file or directory)`);
       this.name = 'L2FSInodeNotFoundError';
   }
}

class L2FS {
   // An FS able to be stored in a string, optimized for running inside web browsers for OS simulations
   #fs = {}
   #otherFSs = {}

   #cleanupPath(path) {
       // Crawl along the path segment after segment, go back one if `..` is hit, ignore single `.`s and return pure path afterwards.
       var purePath = [];
       for (const pathSeg of path.split('/')) {
           if (['','.'].includes(pathSeg)) {
               continue; // Jump over this part to effectively remove it. 
           } else if (pathSeg==='..') {
               purePath.pop(); // Remove the previous part (if possible) to effectively go back up one level again 
           } else {
               purePath.push(pathSeg); // Just add the segment to the path, it's not affecting other parts of the path. 
           }
       }
       return '/'+purePath.join('/');
   }

   constructor() {
       this.#fs = {}; // Ensure that FS is empty on creation
       this.createInode('/','dir',{owner:'root:root',perms:'drwxr-xr-x'}); // Create base directory for all files to go into (Args: nodeName,nodeType,nodeProps)
   }

   toString(indent=0) { // Export file system to JSON
       const devDirs = [];
       return JSON.stringify(this.#fs, (k,v)=>{
           if ((v.type==='dir')&&v.isDevice) {
               devDirs.push(k); // If k is a devDir, add it to the list of devDirs
               return undefined; // Discard inode
           }
           return (devDirs.filter(devDir=>k.startsWith(`${devDir}/`)).length)?undefined:v; // If any of the devDirs is a parent for k, discard k.
       },indent);
   }
   fromString(fs) { // Import file system from JSON
       const oldFS = this.#fs;
       try {
           this.#fs = JSON.parse(fs);
           for (const inode in this.#fs) {
               if (!inode.startsWith('/')) {
                   this.#fs = oldFS; // Revert changes 
                   return false; // The FS isn't in a correct format!
               }
           }
       } catch(err) {
           return false;
       }
       return true;
   }

   getFileParentFS(nodeName) {
       const path = this.#cleanupPath(nodeName);
       //TODO: Implement this! (if path begins with one of the this.#otherFSs paths, remove our part of the path and return theirs, along with their FS class)
       for (const otherFSPath in this.#otherFSs) {
           if (path+'/'.startsWith(otherFSPath+'/')) {
               const otherFS = this.#otherFSs[otherFSPath]?.getFileParentFS?.(/*'/'+*/path.substr(0,otherFSPath.length)); // `?.`: don't throw invalid reference errors, just return `undefined` instead.
               if (![this,undefined].includes(otherFS?.fs)) {
                   return {
                       path: '/'+path.substr(0,otherFSPath.length),
                       fs:   this.#otherFSs[otherFSPath]
                   }
               }
           }
       }
       return {
           path: path,
           fs:   this
       }
   }

   mount(mountpoint, fsToMount, nodeProps) {
       const path = this.#cleanupPath(mountpoint);
       const fileParentFS = this.getFileParentFS(path);
       if (fileParentFS?.fs===this) {
           for (const otherFS in this.#otherFSs) { // Ensure that no FS is double-mounted and no mountpoint is double-used
               if (fsToMount===this.#otherFSs[otherFS]) {
                   throw new L2FSError(`Cannot mount a ${fsToMount?.constructor?.name} in ${path}: is already mounted in '${otherFS}'`);
               } else if (otherFS===path) {
                   throw new L2FSError(`Cannot mount a ${fsToMount?.constructor?.name} in ${path}: a ${this.#otherFSs[otherFS]?.constructor?.name} is already mounted there!`);
               }
           }
           if (path in this.#fs) {
               this.getInode(path).isDevice = true;
               this.#otherFSs[path] = fsToMount;
           } else {
               this.createInode(path, 'dir', {isDevice:true,accessorObject:fsToMount,owner:nodeProps?.owner}); // Create the dir as the mountpoint
           }
           return true;
       } else {
           if (fileParentFS?.fs?.mount('/'+mountpoint.slice(fileParentFS?.path?.length), fsToMount, nodeProps)) { // Try to mount, if that is not implemented, fail silently.
               return true;
           } else {
               return false;
           }
       }
   }

   umount(mountpoint) {
       //TODO: Implement this! Also don't forget to implement the "If on other FS, let that FS make the change!" functionality in the other methods!
   }

   createInode(nodeName,nodeType='dir',nodeProps) {
       if (typeof nodeName !== 'string' || nodeName==='') {
           throw new TypeError('L2FS.createInode(): cannot create inode with non-string or empty path!');
       }
       const path = this.#cleanupPath(nodeName);
       const nodeParentFS = this.getFileParentFS(path);
       if (nodeParentFS.fs!==this) { // If we don't own the place, 
           return nodeParentFS.fs.createInode('/'+path.slice(nodeParentFS?.path?.length), nodeType, nodeProps); // tell the owner to do it for us.
       }
       if (!(path in this.#fs)) {
           if ((this.#fs[path.substring(0,path.lastIndexOf('/'))||'/'])) { // Try to open parent dir, if parent dir name is empty, take '/' as parent dir (other dirs are stored without their trailing '/')
               if (this.#fs[path.substring(0,path.lastIndexOf('/'))||'/']?.type!=='dir') {
                   throw new L2FSError(`Cannot create inode inside non-directory inode '${path.substring(0,path.lastIndexOf('/'))}'!`);
               } else {
                   // The parent inode exists and is a dir, go on!
               }
           } else if (path==='/') {
               // '/' needs no parent inode, so go on!
           } else {
               //throw new L2FSInodeNotFoundError(path.substring(0,path.lastIndexOf('/'))||'/'); // Inform the caller that the parent doesn't exist!
               this.createInode(path.substring(0,path.lastIndexOf('/')), 'dir', {owner:nodeProps?.owner}); // Create the parent dir with default permissions but same owner, so non-root users cannot create root-owned dirs
               console.info(`L2FS: Created parent dir '${path.substring(0,path.lastIndexOf('/'))}' for new inode '${path}'.`);
           }
           switch (nodeType) {
               case ('dir'): {
                   this.#fs[path] = {
                       type: 'dir',
                       owner: nodeProps?.owner||'root:root',
                       perms: nodeProps?.perms||'drwxr-xr--',
                       isDevice: (nodeProps?.isDevice===undefined)?false:nodeProps?.isDevice, // Is set to true for directories that represent another file system
                       meta: {}, // Here goes all metadata
                   };
                   if (nodeProps?.isDevice) {
                       this.#otherFSs[path] = nodeProps?.accessorObject; // An object that implements the same methods as L2FS, to make it possible for L2FS to access it.
                   }
                   break;
               }
               case ('file'): {
                   this.#fs[path] = {
                       type: 'file',
                       owner: nodeProps?.owner||'root:root',
                       perms: nodeProps?.perms||'frw-r--r--',
                       meta: {}, // Here goes all metadata
                       data: '' // Here goes the Base64-encoded data
                   };
                   if (nodeProps?.isPipe) {
                       Object.defineProperties(this.#fs[path], {
                       isPipe: {
                           get: ()=>{return true;},
                           set: undefined
                       },
                       data: { // Instead of actual data, define a getter and setter. To leave either of them undefined, just set them to `undefined`.
                               get: nodeProps?.pipeGet, // Piping data into the application that created it
                               set: nodeProps?.pipeSet // Piping data out of the application that created it
                           }
                       });
                   } else {
                       Object.defineProperty(this.#fs[path], 'isPipe', {
                           get: ()=>{return false;},
                           set: undefined
                       });
                   }
                   break;
               }
               case ('link'): {
                   this.#fs[path] = {
                       type: 'link',
                       owner: nodeProps?.owner||'root:root',
                       perms: nodeProps?.perms||'lrw-r--r--',
                       meta: {}, // Here goes all metadata
                       target: nodeProps?.target||'' // Where the link points
                   };
                   break;
               }
               default: {
                   throw new L2FSError(`'${nodeType}' is not a valid L2FS inode type!`);
               }
           }
       } else {
           throw new L2FSError(`'${path.replaceAll("'", "\\'")}' does already exist!`);
       }
   }

   linkTarget(nodeName, newTarget) {
       const node = this.getInode(nodeName);
       const nodeParentFS = this.getFileParentFS(node);
       if (nodeParentFS.fs!==this) { // If we don't own the place, 
           return nodeParentFS.fs?.linkTarget?.('/'+node.slice(nodeParentFS?.path?.length), newTarget); // tell the owner to do it for us.
       }
       if (node.type==='link') {
           if (newTarget instanceof String) {
               node.target = newTarget; // Don't #cleanupPath it because that would always make an absolute path from it, which isn't always desirable!
           } else {
               return node.target;
           }
       } else {
           throw new L2FSError(`L2FS: Cannot ${(newTarget instanceof String)?'change':'read'} link target on non-link inode: ${this.#cleanupPath(nodeName)}`);
       }
   }

   chown(nodeName, grp,usr) {
       const path = this.#cleanupPath(nodeName);
       const nodeParentFS = this.getFileParentFS(path);
       if (nodeParentFS.fs!==this) { // If we don't own the place, 
           return nodeParentFS.fs?.chown?.('/'+path.substr(0,nodeParentFS?.path?.length), grp,usr); // tell the owner to do it for us.
       }
       if (!grp && !usr) {
           return this.#fs[path].owner;
       }
       if ((path in this.#fs)&&validateUsername(grp)&&validateUsername(usr)) {
           const [oldgrp,oldusr] = this.#fs[path].owner.split(':');
           this.#fs[path].owner = `${grp||oldgrp}:${usr||oldusr}`; // Only change the given details, leave potentially ungiven details as they are
       } else {
           throw (path in this.#fs) ? (new L2FSError(`Cannot set owner on '${path.replaceAll("'", "\\'")}': invalid group/user name!`)) : (new L2FSInodeNotFoundError(path));
       }
   }

   chmod(nodeName, perms) {
       const path = this.#cleanupPath(nodeName);
       const nodeParentFS = this.getFileParentFS(path);
       if (nodeParentFS.fs!==this) { // If we don't own the place, 
           return nodeParentFS.fs?.chmod?.('/'+path.substr(0,nodeParentFS?.path?.length), perms); // tell the owner to do it for us.
       }
       if (path in this.#fs) {
           if (!perms) {
               return this.#fs[path].perms;
           }
           const fail = (i)=>{throw new L2FSError(`L2FS: Invalid permission '${perms[i]}' on index[${i}] in perms '${perms}'!`);}
           const verifiedPerms = [];
           if (perms.length!=7) {
               throw new L2FSError(`L2FS: Cannot set permissions on inode '${path}': invalid perm-string length of ${perms.length} (must be 7)`);
           }
           if (['d','f','l'].includes(perms[0])) {
               verifiedPerms.push(perms[0]);
           } else if (perms[0]==='-') {
               verifiedPerms.push(this.#fs[path].perms[0]);
           } else {
               fail(0);
           }
           if (['r','-'].includes(perms[1])) {
               verifiedPerms.push(perms[1]);
           } else {
               fail(1);
           }
           if (['w','-'].includes(perms[2])) {
               verifiedPerms.push(perms[2]);
           } else {
               fail(2);
           }
           if (['x','-'].includes(perms[3])) {
               verifiedPerms.push(perms[3]);
           } else {
               fail(3);
           }
           if (['r','-'].includes(perms[4])) {
               verifiedPerms.push(perms[4]);
           } else {
               fail(4);
           }
           if (['w','-'].includes(perms[5])) {
               verifiedPerms.push(perms[5]);
           } else {
               fail(5);
           }
           if (['x','-'].includes(perms[6])) {
               verifiedPerms.push(perms[6]);
           } else {
               fail(6);
           }

           this.#fs[path].perms = verifiedPerms.join('');
       } else {
           throw new L2FSError(`Cannot set permissions on '${path.replaceAll("'", "\\'")}': invalid group/user name!`);
       }
   }

   removeInode(nodeName) {
       const path = this.#cleanupPath(nodeName);
       const nodeParentFS = this.getFileParentFS(path);
       if (nodeParentFS.fs!==this) { // If we don't own the place, 
           return nodeParentFS.fs?.removeInode?.('/'+path.substr(0,nodeParentFS?.path?.length)); // tell the owner to do it for us.
       }
       if (path in this.#fs) {
           for (const inode in this.#fs) {
               if (inode.startsWith(path)) {
                   delete this.#fs[path]; // Delete the given inode and all its children if applicable
               }
           }
       } else {
           throw new L2FSInodeNotFoundError(path);
       }
   }

   isDir(nodeName) {
       const path = this.#cleanupPath(nodeName);
       const nodeParentFS = this.getFileParentFS(path);
       if (nodeParentFS.fs===this) {
           switch (this.#fs[path]?.type==='dir') {
               case ('dir'): {
                   return true;
               }
               case ('link'): {
                   const linkTarget = this.#fs[path].target;
                   return this.isDir((linkTarget.startsWith('/')) ? linkTarget : `${path.substring(0,path.lastIndexOf('/'))}/${linkTarget}`);
               }
               case ('file'): {
                   return false;
               }
               default: {
                   return false;
               }
           }
       } else {
           return nodeParentFS.fs?.isDir?.('/'+path.substr(0,nodeParentFS?.path?.length));
       }
   }

   isFile(nodeName) {
       const path = this.#cleanupPath(nodeName);
       const nodeParentFS = this.getFileParentFS(path);
       if (nodeParentFS.fs===this) {
           switch (this.#fs[path]?.type==='dir') {
               case ('file'): {
                   return true;
               }
               case ('link'): {
                   const linkTarget = this.#fs[path].target;
                   return this.isFile((linkTarget.startsWith('/')) ? linkTarget : `${path.substring(0,path.lastIndexOf('/'))}/${linkTarget}`);
               }
               case ('dir'): {
                   return false;
               }
               default: {
                   return false;
               }
           }
       } else {
           return nodeParentFS.fs?.isFile?.('/'+path.substr(0,nodeParentFS?.path?.length));
       }
   }

   isSymlink(nodeName) {
       const path = this.#cleanupPath(nodeName);
       const nodeParentFS = this.getFileParentFS(path);
       if (nodeParentFS.fs===this) {
           switch (this.#fs[path]?.type==='dir') {
               case ('dir'): {
                   return false;
               }
               case ('link'): {
                   return true;
               }
               case ('file'): {
                   return false;
               }
               default: {
                   return false;
               }
           }
       } else {
           return nodeParentFS.fs?.isSymlink?.('/'+path.substr(0,nodeParentFS?.path?.length));
       }
   }

   getInodeMetadata(nodeName) {
       return this.getInode(nodeName)?.meta;
   }

   moveInode(nodeName, destination) {
       const [path,dest] = [this.#cleanupPath(nodeName),this.#cleanupPath(nodeName)];
       const [nodeParentFS,destParentFS] = [this.getFileParentFS(path),this.getFileParentFS(dest)];
       if (nodeParentFS.fs===this && destParentFS.fs===this) { // If we own both places, we can go ahead and move the inode ourselves.
           if (path in this.#fs) {
               this.#fs[dest] = this.#fs[path]; // Set new link to data, possibly silently overwriting existing data. If a directory is overwritten its children can still be accessed, although they will get forgotten eventually.
               delete this.#fs[path]; // Remove old link to data
           } else {
               throw new L2FSInodeNotFoundError(path);
           }
       } else if (nodeParentFS.fs===destParentFS.fs) {
           return nodeParentFS.fs?.moveInode?.('/'+path.substr(0,nodeParentFS?.path?.length), '/'+dest.slice(destParentFS?.path?.length));
       } else {
           const oldInodeIsDir = nodeParentFS.fs?.isDir?.(path);
           const [pathOnSourceFS, pathOnDestFS] = ['/'+path.substr(0,nodeParentFS?.path?.length), '/'+dest.slice(destParentFS?.path?.length)];
           destParentFS.fs?.createInode?.(pathOnDestFS, (oldInodeIsDir)?'dir':'file', {
               owner: nodeParentFS.fs?.chown?.(pathOnSourceFS),
               perms: nodeParentFS.fs?.chmod?.(pathOnSourceFS),
               meta: nodeParentFS.fs?.getInodeMetadata?.(pathOnSourceFS)
           });
           if (!oldInodeIsDir) {
               destParentFS.fs?.writeFile?.(
                   pathOnDestFS, 
                   nodeParentFS.fs?.readFile?.(pathOnSourceFS)
               );
           }
           nodeParentFS.fs?.removeInode?.(pathOnSourceFS);
       } 
   }

   writeFile(nodeName, data) {
       const path = this.#cleanupPath(nodeName);
       const nodeParentFS = this.getFileParentFS(path);
       if (nodeParentFS.fs!==this) { // If we don't own the place, 
           return nodeParentFS.fs?.writeFile?.('/'+path.slice(nodeParentFS?.path?.length), data); // tell the owner to do it for us.
       }
       if (path in this.#fs) {
           const encodedData = btoa(String.fromCodePoint(...(new TextEncoder()).encode(data))); // Why this hassle? `btoa` hates characters with a codepoint above 255.
           switch (this.#fs[path].type) {
               case ('file'): {
                   try {
                       this.#fs[path].data = encodedData;
                   } catch(err) {
                       if (this.#fs[path].isPipe) {
                           throw new L2FSError(`Cannot write to read-only pipe ${path}`);
                       } else {
                           console.log('Oops!');//debug
                           throw err;
                       }
                   }
                   break; // Prevent the other cases from triggering
               }
               case ('link'): {
                   const linkTarget = this.#fs[path].target;
                   this.writeFile((linkTarget.startsWith('/')) ? linkTarget : `${path.substring(0,path.lastIndexOf('/'))}/${linkTarget}`, data); // Write to the target file instead of the link itself
                   break;
               }
               case ('dir'): {
                   throw new L2FSError(`L2FS: Cannot write to inode of type 'dir': ${path}`);
               }
               default: {
                   console.warn(`L2FS: Cannot write to inode of invalid type '${this.#fs[path].type}': ${path}`);
               }
           }
       } else {
           throw new L2FSInodeNotFoundError(path);
       }
   }

   readFile(nodeName) {
       const path = this.#cleanupPath(nodeName);
       const nodeParentFS = this.getFileParentFS(path);
       if (nodeParentFS.fs!==this) { // If we don't own the place, 
           //FIXME: Somehow this code refers to the wrong file when reading from an own symlink to a mounted path…
           return nodeParentFS.fs?.readFile?.('/'+path.slice(nodeParentFS?.path?.length)); // tell the owner to do it for us.
       }
       if (path in this.#fs) {
           switch (this.#fs[path].type) {
               case ('file'): {
                   try {
                       return atob(this.#fs[path].data); // The data is always stored Base64-encoded, so we decode it here.
                   } catch(err) {
                       if (this.#fs[path].isPipe) {
                           throw new L2FSError(`Cannot read from write-only pipe ${path}`);
                       } else {
                           throw err;
                       }
                   }
               }
               case ('link'): {
                   const linkTarget = this.#fs[path].target;
                   return this.readFile((linkTarget.startsWith('/')) ? linkTarget : `${path.substring(0,path.lastIndexOf('/'))}/${linkTarget}`); // Read from the target file instead of the link itself
               }
               case ('dir'): {
                   throw new L2FSError(`L2FS: Cannot read from inode of type 'dir': ${path}`);
               }
               default: {
                   console.warn(`L2FS: Cannot read from inode of invalid type: ${path}`);
               }
           }
       } else {
           throw new L2FSInodeNotFoundError(path);
       }
   }

   getInode(nodeName) {
       const path = this.#cleanupPath(nodeName);
       const nodeParentFS = this.getFileParentFS(path);
       /*if (nodeParentFS.fs!==this) { // If we don't own the place, 
           return nodeParentFS.fs?.getInode?.('/'+path.substr(0,nodeParentFS?.path?.length)); // tell the owner to do it for us.
       }*/
       if (path in this.#fs) {
           return this.#fs[path];
       } else {
           throw new L2FSInodeNotFoundError(path);
       }
   }
}