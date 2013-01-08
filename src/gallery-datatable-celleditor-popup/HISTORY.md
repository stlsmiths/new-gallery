Change History :  gallery-datatable-celleditor-popup
======================================

1/2/13
------
* initial module creation / push to gh
* defines `Y.DataTable.BaseCellPopupEditor` class as generic inline view class
* initial implementation of keyboard filtering (via ATTR `keyFiltering`) and saving validation via ATTR `validator` 
* setup several pre-built basic configurations for;
 * `text`
 * `textarea`
 * `number` (a textbox with key filtering and validation for numeric input only)
 * `date` (a textbox with key filtering and validation for Date input only)
 * `calendar` (includes an INPUT[type=textbox] and a Y.Calendar widget within the view)
 * `checkbox`
 * `radio`
 * `select` / `dropdown` / `combobox`
 * `autocomplete`

1/8/13:
------
* modified the published event structure (per advice of **Satyam** via issues he raised ... Thank you!)
* added events `editorSave` and `editorCancel` as preventable events (still untested)
* streamlined the keyboard filtering and validation coding
* converted messy "inputCollection" HTML definition to streamlined Y.Template usage (default `Y.Template.Micro`) for HTML generation within the Overlay
* proposed for initial CDN push to YUI Gallery 
