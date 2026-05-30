const fs = require('fs');

let content = fs.readFileSync('src/components/MeetingDetail.tsx', 'utf8');

const summaryStartText = "{/* Executive summary block (Editable) */}";
const summaryStartIndex = content.indexOf(summaryStartText);

if (summaryStartIndex === -1) {
    console.error("Could not find summary start text");
    process.exit(1);
}

// Find the line start of the summary block
const blockStart = content.lastIndexOf("\n", summaryStartIndex);

// Find the end of the block. Next block is "{/* Topics Array */}"
const topicsStartText = "{/* Topics Array */}";
const topicsStartIndex = content.indexOf(topicsStartText);

if (topicsStartIndex === -1) {
    console.error("Could not find topics start text");
    process.exit(1);
}

const blockEnd = content.lastIndexOf("\n", topicsStartIndex);

const summaryBlock = content.substring(blockStart, blockEnd);

// Remove summary block
content = content.substring(0, blockStart) + content.substring(blockEnd);

// Find where to insert it. After "{/* Multi tag center */}" block.
// The next block after Multi tag center is the end of the summary tab, so we can insert it just before the `</form>` or `</div>` that closes Multi tag center.
// Actually, let's insert it before the closing of the `detail-tabbox-summary` div.
// That div is closed before `{(activeTab === "actions" || window.matchMedia("print").matches) && (`
const actionsTabStartText = '{(activeTab === "actions" || window.matchMedia("print").matches) && (';
const actionsTabStartIndex = content.indexOf(actionsTabStartText);

if (actionsTabStartIndex === -1) {
    console.error("Could not find actions tab start text");
    process.exit(1);
}

// Find the closing </div> of the summary tab
const insertPosition = content.lastIndexOf("          </div>", actionsTabStartIndex);

if (insertPosition !== -1) {
    content = content.substring(0, insertPosition) + summaryBlock + "\n" + content.substring(insertPosition);
} else {
    console.error("Could not find insertion point");
    process.exit(1);
}

fs.writeFileSync('src/components/MeetingDetail.tsx', content);
console.log("Reordered UI successfully!");
