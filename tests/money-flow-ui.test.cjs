const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c={renderMoneyView(){},document:{addEventListener(){}},escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')};
vm.createContext(c);require('./ui-test-runtime.cjs').runInContext(fs.readFileSync(path.join(__dirname,'../money-flow-ui.js'),'utf8'),c);
test('section navigation uses buttons rather than routing hashes',()=>{const h=c.moneyFlowNavigationMarkup([{id:'a',title:'Recorded balances'}]);assert.match(h,/data-money-section="a"/);assert.match(h,/Recorded balances/);assert.doesNotMatch(h,/href=|data-money-open/);});
test('captured section labels are escaped',()=>{const h=c.moneyFlowNavigationMarkup([{id:'a"',title:'<script>'}]);assert.match(h,/a&quot;/);assert.match(h,/&lt;script>/);});
test('Money adapter has no ledger or persistence writes',()=>{const s=fs.readFileSync(path.join(__dirname,'../money-flow-ui.js'),'utf8');assert.doesNotMatch(s,/moneySave\(|saveTasks\(|fetch\(|ledgerEvents\.push|moneyCurrentOwed\(/);assert.match(s,/prefers-reduced-motion/);});
