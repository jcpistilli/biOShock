/*
 File System
 Jonathan Pistilli
 */

module biOShock {

    export class fileSystem extends DeviceDriver
    {
        public tracks = 0;
        public sectors = 0;
        public blocks = 0;


        constructor()
        {
            super(this.krnFileSystemDriverEntry, this.krnFileSystemISR);
        }

        public krnFileSystemDriverEntry()
        {
            this.status = "file system loaded";
        }

        public krnFileSystemISR()
        {

        }

    }
}