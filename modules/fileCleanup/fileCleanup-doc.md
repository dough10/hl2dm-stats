## Constants

<dl>
<dt><a href="#Timer">Timer</a></dt>
<dd><p>A class for timing duration of things</p>
</dd>
<dt><a href="#print">print</a></dt>
<dd><p>log message to console with time stamp</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#saveTop">saveTop(lastMonth)</a></dt>
<dd><p>saves top data before log clear</p>
</dd>
<dt><a href="#zipLogs">zipLogs(lastMonth)</a></dt>
<dd><p>zip log files before cleanUp deletes them</p>
</dd>
<dt><a href="#zipDemos">zipDemos(lastMonth)</a></dt>
<dd><p>zip demo files before cleanUp deletes them</p>
</dd>
<dt><a href="#deleteLogs">deleteLogs()</a></dt>
<dd><p>remove all log files from logs folder</p>
</dd>
<dt><a href="#deleteDemos">deleteDemos()</a></dt>
<dd><p>remove all demo files from game folder</p>
</dd>
<dt><a href="#cleanUp">cleanUp()</a></dt>
<dd><p>end of month file cleanup process</p>
</dd>
</dl>

<a name="Timer"></a>

## Timer
A class for timing duration of things

**Kind**: global constant  
<a name="print"></a>

## print
log message to console with time stamp

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | message to be printed |

<a name="saveTop"></a>

## saveTop(lastMonth)
saves top data before log clear

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| lastMonth | <code>Number</code> | new Date() output for the time cleanup() was run |

<a name="zipLogs"></a>

## zipLogs(lastMonth)
zip log files before cleanUp deletes them

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| lastMonth | <code>Number</code> | new Date() output for the time cleanup() was run |

<a name="zipDemos"></a>

## zipDemos(lastMonth)
zip demo files before cleanUp deletes them

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| lastMonth | <code>Number</code> | new Date() output for the time cleanup() was run |

<a name="deleteLogs"></a>

## deleteLogs()
remove all log files from logs folder

**Kind**: global function  
<a name="deleteDemos"></a>

## deleteDemos()
remove all demo files from game folder

**Kind**: global function  
<a name="cleanUp"></a>

## cleanUp()
end of month file cleanup process

**Kind**: global function  
