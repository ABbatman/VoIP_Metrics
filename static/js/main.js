
let allSupplierData = [];

  // Merge current and yesterday metrics by customer + destination and calculate percentage change
  function mergeAndCompare(current, yesterday) {
  const yesterdayMap = {};
  yesterday.forEach(row => {
    const key = `${row.customer}|${row.destination}`;
    yesterdayMap[key] = row;
  });

  const merged = [];

  current.forEach(row => {
    const key = `${row.customer}|${row.destination}`;
    const yRow = yesterdayMap[key] || {};

    const makePct = (curr, prev) => {
      if (!prev || prev === 0) return 0;
      return +(((curr - prev) / prev) * 100).toFixed(1);
    };

    merged.push({
      customer: row.customer,
      supplier: row.supplier,
      destination: row.destination,

      Min: row.Min,
      YMin: yRow.Min || 0,
      MinPct: makePct(row.Min, yRow.Min),

      ACD: row.ACD,
      YACD: yRow.ACD || 0,
      ACDPct: makePct(row.ACD, yRow.ACD),

      ASR: row.ASR,
      YASR: yRow.ASR || 0,
      ASRPct: makePct(row.ASR, yRow.ASR),

      SCall: row.SCall,
      YSCall: yRow.SCall || 0,
      SCallPct: makePct(row.SCall, yRow.SCall),

      TCall: row.TCall,
      YTCall: yRow.TCall || 0,
      TCallPct: makePct(row.TCall, yRow.TCall),

      PDD: row.PDD,
      YPDD: yRow.PDD || 0,
      PDDPct: makePct(row.PDD, yRow.PDD),

      ATime: row.ATime,
      YATime: yRow.ATime || 0,
      ATimePct: makePct(row.ATime, yRow.ATime),

      ADur: row.ADur,
      YADur: yRow.ADur || 0,
      ADurPct: makePct(row.ADur, yRow.ADur)
    });
  });

  return merged;
}

// Group data (current or yesterday) by customer + destination
function groupByCustomerDestination(data) {
  const grouped = {};

  data.forEach(row => {
    const key = `${row.customer}|${row.destination}`;

    if (!grouped[key]) {
      grouped[key] = {
        customer: row.customer,
        destination: row.destination,
        seconds: 0,
        start_nuber: 0,
        start_attempt: 0,
        disc_reason: 0,
        pdd_total: 0,
        answer_time_total: 0,
        duration_total: 0,
        count: 0
      };
    }

    grouped[key].seconds += Number(row.seconds || 0);
    grouped[key].start_nuber += Number(row.start_nuber || 0);
    grouped[key].start_attempt += Number(row.start_attempt || 0);
    grouped[key].disc_reason += Number(row.disc_reason || 0);
    grouped[key].pdd_total += Number(row.pdd || 0);
    grouped[key].answer_time_total += Number(row.answer_time || 0);
    grouped[key].duration_total += Number(row.avg_duration || 0);
    grouped[key].count += 1;
  });

  // Convert grouped objects into array with calculated metrics
  const result = [];

  for (const key in grouped) {
    const g = grouped[key];

    result.push({
      customer: g.customer,
      destination: g.destination,
      Min: g.seconds ? Math.round(g.seconds / 60) : 0,
      ACD: g.start_nuber ? +((g.seconds / g.start_nuber / 60).toFixed(1)) : 0,
      ASR: g.start_attempt ? Math.round((g.start_nuber / g.start_attempt) * 100) : 0,
      SCall: g.start_nuber,
      TCall: g.start_attempt,
      PDD: g.count ? +(g.pdd_total / g.count / 1000).toFixed(1) : 0,
      ATime: g.count ? Math.round(g.answer_time_total / g.count) : 0,
      ADur: g.count ? +((g.duration_total / g.count / 60).toFixed(1)) : 0
    });
  }

  return result;
}

// Group by supplier + destination, and show each customer individually
function groupBySupplierDestinationCustomer(data) {
  const grouped = {};

  data.forEach(row => {
    const key = `${row.supplier}|${row.destination}|${row.customer}`;

    if (!grouped[key]) {
      grouped[key] = {
        supplier: row.supplier,
        customer: row.customer,
        destination: row.destination,
        seconds: 0,
        start_nuber: 0,
        start_attempt: 0,
        pdd_total: 0,
        answer_time_total: 0,
        duration_total: 0,
        count: 0
      };
    }

    grouped[key].seconds += Number(row.seconds || 0);
    grouped[key].start_nuber += Number(row.start_nuber || 0);
    grouped[key].start_attempt += Number(row.start_attempt || 0);
    grouped[key].pdd_total += Number(row.pdd || 0);
    grouped[key].answer_time_total += Number(row.answer_time || 0);
    grouped[key].duration_total += Number(row.avg_duration || 0);
    grouped[key].count += 1;
  });

  return Object.values(grouped).map(g => ({
    supplier: g.supplier,
    customer: g.customer,
    destination: g.destination,
    Min: g.seconds ? Math.round(g.seconds / 60) : 0,
    ACD: g.start_nuber ? +((g.seconds / g.start_nuber / 60).toFixed(1)) : 0,
    ASR: g.start_attempt ? Math.round((g.start_nuber / g.start_attempt) * 100) : 0,
    SCall: g.start_nuber,
    TCall: g.start_attempt,
    PDD: g.count ? +(g.pdd_total / g.count / 1000).toFixed(1) : 0,
    ATime: g.count ? Math.round(g.answer_time_total / g.count) : 0,
    ADur: g.count ? +((g.duration_total / g.count / 60).toFixed(1)) : 0
  }));
}

// Group data by supplier and destination
function groupBySupplierDestination(data) {
  const grouped = {};

  data.forEach(row => {
    const key = `${row.supplier}|${row.destination}`;

    // Initialize new group if not yet created
    if (!grouped[key]) {
      grouped[key] = {
        supplier: row.supplier,
        destination: row.destination,
        seconds: 0,
        start_nuber: 0,
        start_attempt: 0,
        pdd_total: 0,
        answer_time_total: 0,
        duration_total: 0,
        count: 0
      };
    }

    // Accumulate values for metrics
    grouped[key].seconds += Number(row.seconds || 0);
    grouped[key].start_nuber += Number(row.start_nuber || 0);
    grouped[key].start_attempt += Number(row.start_attempt || 0);
    grouped[key].pdd_total += Number(row.pdd || 0);
    grouped[key].answer_time_total += Number(row.answer_time || 0);
    grouped[key].duration_total += Number(row.avg_duration || 0);
    grouped[key].count += 1;
  });

  // Convert grouped data into final array with calculated metrics
  return Object.values(grouped).map(g => ({
    supplier: g.supplier,
    destination: g.destination,
    Min: g.seconds ? Math.round(g.seconds / 60) : 0,
    ACD: g.start_nuber ? +((g.seconds / g.start_nuber / 60).toFixed(1)) : 0,
    ASR: g.start_attempt ? Math.round((g.start_nuber / g.start_attempt) * 100) : 0,
    SCall: g.start_nuber,
    TCall: g.start_attempt,
    PDD: g.count ? +(g.pdd_total / g.count / 1000).toFixed(1) : 0,
    ATime: g.count ? Math.round(g.answer_time_total / g.count) : 0,
    ADur: g.count ? +((g.duration_total / g.count / 60).toFixed(1)) : 0
  }));
}

function loadMetricsWithComparison(showTable = false) {
  console.log("🟡 reverseMode =", reverseMode);

  // Hide summary table if not requested
  if (!showTable) {
    document.getElementById("summaryTable").classList.add("hidden");
  }

  // Update table header labels and sort icons
  updateSortIcons();

  // Collect input filter values
  const customer = document.getElementById("customerInput").value.trim();
  const supplier = document.getElementById("supplierInput").value.trim();
  const destination = document.getElementById("destinationInput").value.trim();
  const from = document.getElementById("fromDate").value + 'T' + document.getElementById("fromTime").value;
  const to = document.getElementById("toDate").value + 'T' + document.getElementById("toTime").value;

  // Calculate 24h ago time range
  const from_y = new Date(new Date(from).getTime() - 24 * 60 * 60 * 1000).toISOString();
  const to_y = new Date(new Date(to).getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Prepare URL query strings
  const paramsToday = new URLSearchParams({ customer, supplier, destination, from, to });
  const paramsYesterday = new URLSearchParams({ customer, supplier, destination, from: from_y, to: to_y });

  // Fetch both datasets (today and yesterday)
  Promise.all([
    fetch(`/api/metrics?${paramsToday}`).then(r => r.json()),
    fetch(`/api/metrics?${paramsYesterday}`).then(r => r.json())
  ])
  .then(([current, yesterday]) => {
    allSupplierData = current;

    const groupedCurrent = reverseMode
      ? groupBySupplierDestination(current)
      : groupByCustomerDestination(current);

    const groupedYesterday = reverseMode
      ? groupBySupplierDestination(yesterday)
      : groupByCustomerDestination(yesterday);

    finalTable = mergeAndCompare(groupedCurrent, groupedYesterday);

    if (showTable) {
  renderTable(); // Show table only if explicitly requested
  document.getElementById("summaryTable").classList.remove("hidden");
} else {
  // Hide table if user only clicked "Find"
  document.getElementById("summaryTable").classList.add("hidden");
}
  })
  .catch(error => {
    console.error("❌ Error loading metrics:", error);
  });
}
    
    
    function showTimeControls(id) {
      document.getElementById(id).classList.remove("hidden");
    }

    function hideTimeControls(id) {
      setTimeout(() => {
        document.getElementById(id).classList.add("hidden");
      }, 200);
    }

    function adjustTime(id, hoursDelta) {
      const timeInput = document.getElementById(id);
      const dateInput = document.getElementById(id === "fromTime" ? "fromDate" : "toDate");
      const currentDate = new Date(dateInput.value + 'T' + timeInput.value + 'Z');
      currentDate.setUTCHours(currentDate.getUTCHours() + hoursDelta);
      timeInput.value = currentDate.toISOString().substr(11, 8);
      dateInput.value = currentDate.toISOString().substr(0, 10);
    }

    function setNow(id) {
      const now = new Date();
      document.getElementById(id).value = now.toISOString().substr(11, 8);
      document.getElementById(id === "fromTime" ? "fromDate" : "toDate").value = now.toISOString().substr(0, 10);
    }

    function setZero(id) {
      document.getElementById(id).value = "00:00:00";
    }

    function setDefaultDateRange() {
        const now = new Date();
        const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        document.getElementById("fromDate").value = from.toISOString().slice(0, 10);
        document.getElementById("fromTime").value = from.toISOString().slice(11, 19);
        document.getElementById("toDate").value = now.toISOString().slice(0, 10);
        document.getElementById("toTime").value = now.toISOString().slice(11, 19);

        document.getElementById("customerInput").value = "";
        document.getElementById("supplierInput").value = "";
        document.getElementById("destinationInput").value = "";
    }

function toggleSuppliers(button) {
  const main = button.dataset.main;
  const destination = button.dataset.destination;
  const currentRow = button.closest("tr");

  console.log("🔍 Expand requested:");
  console.log("Mode:", reverseMode ? "Supplier → Customers" : "Customer → Suppliers");
  console.log("Main:", main, "Destination:", destination);

  const parentKey = `${main}|${destination}`;
  let next = currentRow.nextElementSibling;
  let isAlreadyExpanded = false;

  // Check if any supplier-row with same parent exists below current row
  while (next && next.dataset && next.dataset.parent === parentKey) {
    isAlreadyExpanded = true;
    break;
  }

// Remove all .supplier-row and all .hourly-row that match this main|destination
document.querySelectorAll(".supplier-row, .hourly-row").forEach(row => {
  const key = row.dataset.parent || "";
  if (key.startsWith(`${main}|`) && key.endsWith(`|${destination}`)) {
    row.remove();
  }
});

  if (isAlreadyExpanded) {
    // If already expanded — collapse only this block and update icon
    button.textContent = "+";
    return;
  }

  // Set button to collapse state
  button.textContent = "−";

  // Filter rows
  const filtered = reverseMode
    ? allSupplierData.filter(row =>
        row.supplier === main && row.destination === destination)
    : allSupplierData.filter(row =>
        row.customer === main && row.destination === destination);

  // Group rows
  const grouped = reverseMode
    ? groupBySupplierDestinationCustomer(filtered)
    : groupByCustomerDestinationSupplier(filtered);

  console.log("Grouped rows:", grouped);

  // Build HTML for inserted rows
  const rowsHTML = grouped.map(s => {
    const name = reverseMode ? s.customer : s.supplier;

  return `
    <tr class="supplier-row bg-gray-100 hover:bg-gray-200 text-sm text-black text-right border-t border-dashed border-gray-300"
        data-parent="${main}|${s.destination}">
      
      <!-- First column: EMPTY to avoid duplication -->
      <td></td>

      <!-- Second column: peer (client or supplier) with + -->
<td class="px-2 py-1 text-left">
  <div class="flex items-center gap-0 pl-1 truncate whitespace-nowrap overflow-hidden">
    <button
      class="text-sm text-blue-600 hover:no-underline"
      data-main="${main || ''}"
      data-peer="${name || ''}"
      data-destination="${s.destination || ''}"
      onclick="toggleHourly(this)"
    >
      +
    </button>
    <span
      class="ml-1 truncate"
      data-tooltip="${name || ''}"
      onmousemove="showTooltip(event)"
      onmouseleave="hideTooltip()"
    >
      ${name || ''}
    </span>
  </div>
</td>
      <!-- Third column: Destination -->
      <td class="px-2 py-1 text-left text-black">${s.destination}</td>

      <!-- Metrics -->
      <td class="px-2 py-1 border-l">${s.Min}</td>
      <td class="px-2 py-1">${s.YMin ?? 0}</td>
      <td class="px-2 py-1 bg-gray-50">${s.MinPct ?? 0}</td>

      <td class="px-2 py-1 border-l">${s.ACD}</td>
      <td class="px-2 py-1">${s.YACD ?? 0}</td>
      <td class="px-2 py-1 bg-gray-50">${s.ACDPct ?? 0}</td>

      <td class="px-2 py-1 border-l">${s.ASR}</td>
      <td class="px-2 py-1">${s.YASR ?? 0}</td>
      <td class="px-2 py-1 bg-gray-50">${s.ASRPct ?? 0}</td>

      <td class="px-2 py-1 border-l">${s.SCall}</td>
      <td class="px-2 py-1">${s.YSCall ?? 0}</td>
      <td class="px-2 py-1 bg-gray-50">${s.SCallPct ?? 0}</td>

      <td class="px-2 py-1 border-l">${s.TCall}</td>
      <td class="px-2 py-1">${s.YTCall ?? 0}</td>
      <td class="px-2 py-1 bg-gray-50">${s.TCallPct ?? 0}</td>

      <td class="px-2 py-1 border-l-2">${s.PDD}</td>
      <td class="px-2 py-1">${s.YPDD ?? 0}</td>
      <td class="px-2 py-1 bg-gray-50">${s.PDDPct ?? 0}</td>

      <td class="px-2 py-1 border-l">${s.ATime}</td>
      <td class="px-2 py-1">${s.YATime ?? 0}</td>
      <td class="px-2 py-1 bg-gray-50">${s.ATimePct ?? 0}</td>
    </tr>
  `;
}).join("");

// Insert rows after the clicked row
currentRow.insertAdjacentHTML("afterend", rowsHTML);
    }


 function toggleHourly(button) {
  const currentRow = button.closest("tr");
  const main = button.dataset.main;
  const peer = button.dataset.peer;
  const destination = button.dataset.destination;
  const parentKey = `${main}|${peer}|${destination}`;

  let hasRemoved = false;
  document.querySelectorAll(`.hourly-row[data-parent="${parentKey}"]`).forEach(row => {
    row.remove();
    hasRemoved = true;
  });

  if (hasRemoved) {
    button.textContent = "+";
    return;
  }

  button.textContent = "−";

  const from = new Date(document.getElementById("fromDate").value + "T" + document.getElementById("fromTime").value);
  const to = new Date(document.getElementById("toDate").value + "T" + document.getElementById("toTime").value);

  const filtered = allSupplierData.filter(row =>
    row.customer === (reverseMode ? peer : main) &&
    row.supplier === (reverseMode ? main : peer) &&
    row.destination === destination
  );

  const hourlyMap = {};

  // Step 1: Group data by hour using raw string (no timezone shift)
filtered.forEach(row => {
  const datePart = row.time.slice(0, 10);             // '2025-05-01'
  const hour = row.time.slice(11, 13) + ':00';         // '23:00'
  const fullKey = `${datePart} ${hour}`;               // '2025-05-01 23:00'

  if (!hourlyMap[fullKey]) {
    hourlyMap[fullKey] = {
      hour,
      date: datePart,
      destination: row.destination,
      seconds: 0,
      start_nuber: 0,
      start_attempt: 0,
      pdd_total: 0,
      answer_time_total: 0,
      count: 0
    };
  }

  const g = hourlyMap[fullKey];
  g.seconds += Number(row.seconds || 0);
  g.start_nuber += Number(row.start_nuber || 0);
  g.start_attempt += Number(row.start_attempt || 0);
  g.pdd_total += Number(row.pdd || 0);
  g.answer_time_total += Number(row.answer_time || 0);
  g.count += 1;
});
  const sortedKeys = Object.keys(hourlyMap).sort(); // "2025-05-01 23:00", "2025-05-02 00:00", ...
  if (sortedKeys.length === 0) return;

  const rows = [];

  sortedKeys.forEach(fullKey => {
    const h = hourlyMap[fullKey];

    const Min = h.seconds ? Math.round(h.seconds / 60) : 0;
    const ACD = h.start_nuber ? +((h.seconds / h.start_nuber / 60).toFixed(1)) : 0;
    const ASR = h.start_attempt ? Math.round((h.start_nuber / h.start_attempt) * 100) : 0;
    const PDD = h.count ? +(h.pdd_total / h.count / 1000).toFixed(1) : 0;
    const ATime = h.count ? Math.round(h.answer_time_total / h.count) : 0;

    const displayDate = `${h.date.split("-").reverse().join(".")}  ${h.hour}`;
    const isNewDay = h.hour === "00:00";
    const rowClass = isNewDay
      ? "hourly-row text-sm text-right bg-olive-800 text-black border-t border-dashed border-gray-300 hover:bg-emerald-600"
      : "hourly-row text-sm text-right bg-gray-50 border-t border-dashed border-gray-300 hover:bg-gray-200";
    const percentCellClass = isNewDay ? "" : "bg-gray-50";

    rows.push(`
      <tr class="${rowClass}" data-parent="${parentKey}">
        <td class="px-2 py-1 text-xs text-black">
          <div class="flex justify-end pr-2">${displayDate}</div>
        </td>
        <td class="px-2 py-1 text-left text-black text-xs">${peer}</td>
        <td class="px-2 py-1 text-left text-black text-xs">${h.destination}</td>

        <td class="px-2 py-1 border-l">${Min}</td>
        <td class="px-2 py-1">-</td>
        <td class="px-2 py-1 ${percentCellClass}">-</td>

        <td class="px-2 py-1">${ACD}</td>
        <td class="px-2 py-1">-</td>
        <td class="px-2 py-1 ${percentCellClass}">-</td>

        <td class="px-2 py-1">${ASR}</td>
        <td class="px-2 py-1">-</td>
        <td class="px-2 py-1 ${percentCellClass}">-</td>

        <td class="px-2 py-1">${h.start_nuber}</td>
        <td class="px-2 py-1">-</td>
        <td class="px-2 py-1 ${percentCellClass}">-</td>

        <td class="px-2 py-1">${h.start_attempt}</td>
        <td class="px-2 py-1">-</td>
        <td class="px-2 py-1 ${percentCellClass}">-</td>

        <td class="px-2 py-1 border-l-2">${PDD}</td>
        <td class="px-2 py-1">-</td>
        <td class="px-2 py-1 ${percentCellClass}">-</td>

        <td class="px-2 py-1">${ATime}</td>
        <td class="px-2 py-1">-</td>
        <td class="px-2 py-1 ${percentCellClass}">-</td>
      </tr>
    `);
  });

  currentRow.insertAdjacentHTML("afterend", rows.join(""));
}


  // Group data by customer + destination + supplier
  function groupByCustomerDestinationSupplier(data) {
    const grouped = {};
    data.forEach(row => {
      const key = `${row.customer}|${row.destination}|${row.supplier}`;
      if (!grouped[key]) {
        grouped[key] = {
          customer: row.customer,
          destination: row.destination,
          supplier: row.supplier,
          seconds: 0,
          start_nuber: 0,
          start_attempt: 0,
          pdd_total: 0,
          answer_time_total: 0,
          duration_total: 0,
          count: 0
        };
      }
      grouped[key].seconds += Number(row.seconds || 0);
      grouped[key].start_nuber += Number(row.start_nuber || 0);
      grouped[key].start_attempt += Number(row.start_attempt || 0);
      grouped[key].pdd_total += Number(row.pdd || 0);
      grouped[key].answer_time_total += Number(row.answer_time || 0);
      grouped[key].duration_total += Number(row.avg_duration || 0);
      grouped[key].count += 1;
    });

    return Object.values(grouped).map(g => ({
      customer: g.customer,
      supplier: g.supplier,
      destination: g.destination,

      Min: g.seconds ? Math.round(g.seconds / 60) : 0,
      ACD: g.start_nuber ? +((g.seconds / g.start_nuber / 60).toFixed(1)) : 0,
      ASR: g.start_attempt ? Math.round((g.start_nuber / g.start_attempt) * 100) : 0,
      SCall: g.start_nuber,
      TCall: g.start_attempt,
      PDD: g.count ? +(g.pdd_total / g.count / 1000).toFixed(1) : 0,
      ATime: g.count ? Math.round(g.answer_time_total / g.count) : 0,
      ADur: g.count ? +((g.duration_total / g.count / 60).toFixed(1)) : 0
    }));
  }

// Store the final table data globally to reuse it for sorting
let finalTable = [];

// Track current sorting state
let currentSort = {
  column: null,
  asc: true
};

// Sort finalTable by selected column and direction
function sortByColumn(column) {
  // Do nothing if there is no data
  if (!finalTable.length) return;

  // Toggle sort direction if clicking the same column again
  if (currentSort.column === column) {
    currentSort.asc = !currentSort.asc;
  } else {
    currentSort.column = column;
    currentSort.asc = true;
  }

  // Perform sorting
  finalTable.sort((a, b) => {
    const valA = a[column];
    const valB = b[column];

    // Move null/undefined to the bottom
    if (valA == null) return 1;
    if (valB == null) return -1;

    // If numbers, do numeric sort
    if (typeof valA === "number" && typeof valB === "number") {
      return currentSort.asc ? valA - valB : valB - valA;
    }

    // Otherwise, do alphabetical sort
    return currentSort.asc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Re-render the table with sorted data
  renderTable();
}

  // Renders the summary table from the global finalTable array
  function renderTable() {
  // Get reference to table body and clear it
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  // Loop through all rows and render them
  finalTable.forEach(row => {
    const main = reverseMode ? row.supplier : row.customer;
    const peer = reverseMode ? (row.customer || "") : (row.supplier || "");

    table.innerHTML += `
      <tr class="hover:bg-gray-200 text-sm text-right">
<td class="px-2 py-1 text-left">
  <div class="flex items-center gap-1">
    ${
      allSupplierData.some(d =>
        (reverseMode
          ? d.supplier === main && d.destination === row.destination
          : d.customer === main && d.destination === row.destination)
      )
        ? `<button
            class="text-sm text-blue-600 hover:no-underline"
            data-main="${main}"
            data-destination="${row.destination}"
            onclick="toggleSuppliers(this)"
          >
            +
          </button>`
        : ''
    }
    <span>${main}</span>
  </div>
</td>
<td class="px-2 py-1 text-left">
  <span
    class="ml-1 truncate whitespace-nowrap overflow-hidden"
    data-tooltip="${peer || ''}"
    onmousemove="showTooltip(event)"
    onmouseleave="hideTooltip()"
  >
    ${peer || ''}
  </span>
</td>
        <td class="px-2 py-1 text-left">${row.destination}</td>

        <td class="px-2 py-1 border-l">${row.Min}</td>
        <td class="px-2 py-1">${row.YMin != null ? row.YMin : 0}</td>
        <td class="px-2 py-1 bg-gray-50">${row.MinPct != null ? row.MinPct : 0}</td>

        <td class="px-2 py-1 border-l">${row.ACD}</td>
        <td class="px-2 py-1">${row.YACD != null ? row.YACD : 0}</td>
        <td class="px-2 py-1 bg-gray-50">${row.ACDPct != null ? row.ACDPct : 0}</td>

        <td class="px-2 py-1 border-l">${row.ASR}</td>
        <td class="px-2 py-1">${row.YASR != null ? row.YASR : 0}</td>
        <td class="px-2 py-1 bg-gray-50">${row.ASRPct != null ? row.ASRPct : 0}</td>

        <td class="px-2 py-1 border-l">${row.SCall}</td>
        <td class="px-2 py-1">${row.YSCall != null ? row.YSCall : 0}</td>
        <td class="px-2 py-1 bg-gray-50">${row.SCallPct != null ? row.SCallPct : 0}</td>

        <td class="px-2 py-1 border-l">${row.TCall}</td>
        <td class="px-2 py-1">${row.YTCall != null ? row.YTCall : 0}</td>
        <td class="px-2 py-1 bg-gray-50">${row.TCallPct != null ? row.TCallPct : 0}</td>

        <td class="px-2 py-1 border-l-2">${row.PDD}</td>
        <td class="px-2 py-1">${row.YPDD != null ? row.YPDD : 0}</td>
        <td class="px-2 py-1 bg-gray-50">${row.PDDPct != null ? row.PDDPct : 0}</td>

        <td class="px-2 py-1 border-l">${row.ATime}</td>
        <td class="px-2 py-1">${row.YATime != null ? row.YATime : 0}</td>
        <td class="px-2 py-1 bg-gray-50">${row.ATimePct != null ? row.ATimePct : 0}</td>

      </tr>
    `;
  });
  // Make sure the table is visible
  document.getElementById("summaryTable").classList.remove("hidden");
  // After rendering the table, update sorting buttons in the header
}

  let reverseMode = false;

  function toggleReverse() {
  reverseMode = !reverseMode;

  const button = document.getElementById("reverseButton");
    if (reverseMode) {
      button.classList.remove("bg-gray-200");
      button.classList.add("bg-gray-500", "text-white");
    } else {
      button.classList.remove("bg-gray-500", "text-white");
      button.classList.add("bg-gray-200");
    }
  }

  // Render correct sort buttons depending on reverseMode state
function updateSortIcons() {
  const mainLabel = document.getElementById("mainLabel");
  const peerLabel = document.getElementById("peerLabel");
  const mainIcon = document.getElementById("mainSortIcon");
  const peerIcon = document.getElementById("peerSortIcon");

  if (reverseMode) {
    mainLabel.textContent = "Supplier";
    mainIcon.innerHTML = getSortButtonHTML("supplier");

    peerLabel.textContent = "Customer";
    peerIcon.innerHTML = getSortButtonHTML("customer");
  } else {
    mainLabel.textContent = "Customer";
    mainIcon.innerHTML = getSortButtonHTML("customer");

    peerLabel.textContent = "Supplier";
    peerIcon.innerHTML = getSortButtonHTML("supplier");
  }
}

// Generate sort button HTML for a given field
function getSortButtonHTML(field) {
  return `
    <button onclick="sortByColumn('${field}')" class="text-blue-400 hover:text-blue-600" title="Sort ${field}">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5 5 5M7 13l5 5 5-5" />
      </svg>
    </button>
  `;
}

// Show tooltip below the hovered element
function showTooltip(event) {
  const target = event.target;
  const text = target.dataset.tooltip;
  if (!text) return;

  // Only show tooltip if text is actually truncated
  if (target.scrollWidth <= target.clientWidth) {
    return;
  }

  const tooltip = document.getElementById("customTooltip");
  tooltip.textContent = text;

  const rect = target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  tooltip.style.top = `${rect.bottom + scrollTop + 4}px`;
  tooltip.style.left = `${rect.left + scrollLeft}px`;

  tooltip.classList.remove("hidden");
}
// Hide tooltip when mouse leaves
function hideTooltip() {
  const tooltip = document.getElementById("customTooltip");
  tooltip.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  setDefaultDateRange();

  window.tooltip = document.getElementById("customTooltip");
});