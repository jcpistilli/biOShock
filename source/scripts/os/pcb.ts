/*
 Process Control Block

 Jonathan Pistilli
 */


module biOShock {
    export class pcb {
        pid: number;
        pc: number;
        ir: number;
        acc: number;
        xReg: number;
        yReg: number;
        zFlag: number;
        base: number;
        limit: number;


        constructor() {
            this.pid   = _GlobPid++;
            this.pc    = 0;
            this.ir    = 0;
            this.acc   = 0;
            this.xReg  = 0;
            this.yReg  = 0;
            this.zFlag = 0;

            //start and finish of memory
            this.base  = 0;
            this.limit = 0;

        }
    }
}
