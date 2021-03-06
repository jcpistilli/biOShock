/* ------------
Globals.ts
Global CONSTANTS and _Variables.
(Global over both the OS and Hardware Simulation / Host.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
//
// Global "CONSTANTS" (There is currently no const or final or readonly type annotation in TypeScript.)
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var APP_NAME = "biOShock";
var APP_VERSION = "21.12";

var CPU_CLOCK_INTERVAL = 100;

var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;

var SYS_OPCODE_IRQ = 2;

var EXECUTING_IRQ = 3;

var MEM_ACCESS_VIOLATION = 4;

var UNKNOWN_OPERATION_IRQ = 5;

var BREAK_IRQ = 6;

var CONTEXT_SWITCH_IRQ = 7;

//
// Global Variables
//
var _CPU;

var _OSclock = 0;
var _Step = false;

var _Mode = 0;

var _Canvas = null;
var _DrawingContext = null;
var _DefaultFontFamily = "sans";
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;

var _Trace = true;

// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn = null;
var _StdOut = null;

//Global stuff I need
var _GlobPid = 0;
var _MemMan = null;

//Memory parts
var _progSize = 256;
var _progNum = 3;
var _memSize = _progSize * _progNum;

//Cycle counter
var _cycleCounter = 0;

//Resident List
var _ResidentList = null;

//Ready Queue
var _ReadyQueue = null;

//Quantum
var _Quantum = 6;

//Current Program
var _currProgram = null;

//Scheduler
var _CpuScheduler = null;

//File System
var _FileSystem = null;

// UI
var _Console;
var _OsShell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

var onDocumentLoad = function () {
    biOShock.Control.hostInit();
};
