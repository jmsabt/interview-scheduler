import React from "react";
import { Download } from "lucide-react";

// CsvExport component for downloading the generated schedule as a CSV file
const CsvExport = ({
  matches,
  unmatched,
  scheduleCapacity,
  scheduleDuration,
}) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Time conversion utilities (duplicated from App.jsx for self-containment)
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // Format time for display (e.g., "09:00" to "9:00 AM")
  const formatDisplayTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (hours === 12) return `12:${minutes.toString().padStart(2, "0")} PM`;
    if (hours > 12)
      return `${hours - 12}:${minutes.toString().padStart(2, "0")} PM`;
    return `${hours}:${minutes.toString().padStart(2, "0")} AM`;
  };

  // Function to generate the CSV content and trigger the download
  const exportSchedule = () => {
    let csvContent = "";

    // --- SECTION 1: INTERVIEW SCHEDULE ---
    csvContent += "INTERVIEW SCHEDULE\n\n";

    // Build the header row for the schedule grid: Start Time, End Time, then the days
    const headerRow = ["Start Time", "End Time", ...days].join(",");
    csvContent += `${headerRow}\n`;

    // Create a map for easy lookup of assigned applicants for each day and time slot
    // Format: scheduleMap[startMinute][dayName] = [applicantNames]
    const scheduleGrid = {};

    // Populate the scheduleGrid from 'matches' data
    matches.forEach((dayData) => {
      dayData.slots.forEach((slot) => {
        const startMinutes = timeToMinutes(slot.start);
        if (!scheduleGrid[startMinutes]) {
          scheduleGrid[startMinutes] = {
            start: slot.start, // Store 24hr for internal use
            end: slot.end, // Store 24hr for internal use
            days: {}, // To store applicants for each day at this start time
          };
          days.forEach((day) => (scheduleGrid[startMinutes].days[day] = [])); // Initialize all days
        }
        // Assign applicants to the correct day within this startMinutes slot
        slot.assigned.forEach((applicant) => {
          scheduleGrid[startMinutes].days[dayData.day].push(applicant.name);
        });
      });
    });

    // Generate all possible time slots to use as rows in the CSV
    const allStartTimesMinutes = new Set();
    const earliestTimeMinutes = timeToMinutes("08:00"); // 8:00 AM
    const latestTimeMinutes = timeToMinutes("22:00"); // 10:00 PM (end of day for slots starting before this)

    for (
      let time = earliestTimeMinutes;
      time < latestTimeMinutes;
      time += scheduleDuration
    ) {
      allStartTimesMinutes.add(time);
    }

    // Sort all unique start times chronologically
    const sortedStartTimesMinutes = Array.from(allStartTimesMinutes).sort(
      (a, b) => a - b
    );

    // Add data rows to CSV content
    sortedStartTimesMinutes.forEach((startMin) => {
      const slotStart24hr = minutesToTime(startMin);
      const slotEnd24hr = minutesToTime(startMin + scheduleDuration);

      const displayStartTime = formatDisplayTime(slotStart24hr);
      const displayEndTime = formatDisplayTime(slotEnd24hr);

      // Start the row with the formatted start and end times, wrapped in quotes
      let row = `"${displayStartTime}","${displayEndTime}"`;

      days.forEach((day) => {
        const applicantsForSlot = scheduleGrid[startMin]?.days[day] || [];
        // Join applicant names with a comma, wrap in quotes to handle commas if names contain them
        row += `,"${applicantsForSlot.join(", ")}"`;
      });
      csvContent += `${row}\n`;
    });

    // --- SECTION 2: UNMATCHED APPLICANTS (if any) ---
    if (unmatched.length > 0) {
      csvContent += "\nUNMATCHED APPLICANTS\n\n";
      csvContent += "Applicant Name\n"; // Header for unmatched section
      unmatched.forEach((applicant) => {
        csvContent += `"${applicant.name}"\n`; // Quote names
      });
    }

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "interview_schedule.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("Your browser does not support direct file downloads.");
    }
  };

  return (
    <button
      onClick={exportSchedule}
      disabled={matches.length === 0 && unmatched.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
    >
      <Download size={16} />
      Export Schedule to CSV
    </button>
  );
};

export default CsvExport;
