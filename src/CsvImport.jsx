import React, { useState } from "react";
import { UploadCloud, CheckCircle, XCircle, Loader2 } from "lucide-react"; // Icons for feedback

// Component for importing applicants from a CSV file
const CsvImport = ({ onApplicantsImported }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" }); // { text: "...", type: "success" | "error" | "info" }
  const [isLoading, setIsLoading] = useState(false);

  // Expected CSV header for validation
  const EXPECTED_HEADERS = [
    "Applicant Name",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Handles file selection from the input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "text/csv") {
        setFile(selectedFile);
        setMessage({
          text: `File selected: ${selectedFile.name}`,
          type: "info",
        });
      } else {
        setFile(null);
        setMessage({ text: "Please select a valid CSV file.", type: "error" });
      }
    } else {
      setFile(null);
      setMessage({ text: "", type: "" });
    }
  };

  // Parses the CSV file content and transforms it into applicant objects
  const parseCsv = (csvText) => {
    const lines = csvText.trim().split("\n");
    if (lines.length === 0) {
      throw new Error("CSV file is empty.");
    }

    // Validate headers
    const headers = lines[0].split(",").map((h) => h.trim());
    if (
      headers.length !== EXPECTED_HEADERS.length ||
      !headers.every((h, i) => h === EXPECTED_HEADERS[i])
    ) {
      throw new Error(
        "Invalid CSV header. Expected: " + EXPECTED_HEADERS.join(",")
      );
    }

    const newApplicants = [];

    // Process each data line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const parts = line.split(",").map((p) => p.trim());
      if (parts.length !== EXPECTED_HEADERS.length) {
        console.warn(`Skipping malformed row ${i + 1}: ${line}`);
        continue; // Skip malformed rows
      }

      const applicantName = parts[0];
      if (!applicantName) {
        console.warn(`Skipping row ${i + 1} due to missing applicant name.`);
        continue;
      }

      const availability = {};
      days.forEach((day, index) => {
        const dayAvailabilityString = parts[index + 1]; // +1 because name is at index 0
        if (dayAvailabilityString) {
          // Split by semicolon for multiple time ranges
          const timeRanges = dayAvailabilityString
            .split(";")
            .map((s) => s.trim());
          availability[day] = timeRanges
            .map((range) => {
              const [start, end] = range.split("-").map((t) => t.trim());
              // Basic format validation (e.g., HH:MM)
              const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
              if (!timeRegex.test(start) || !timeRegex.test(end)) {
                console.warn(
                  `Invalid time format in row ${
                    i + 1
                  }, day ${day}: ${range}. Skipping this range.`
                );
                return null; // Return null for invalid ranges
              }
              return { start, end };
            })
            .filter(Boolean); // Filter out any nulls from invalid ranges
        } else {
          availability[day] = [];
        }
      });

      newApplicants.push({
        id: Date.now() + i, // Unique ID for each applicant
        name: applicantName,
        availability: availability,
      });
    }
    return newApplicants;
  };

  // Handles the import button click
  const handleImport = () => {
    if (!file) {
      setMessage({ text: "Please select a CSV file first.", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "Importing...", type: "info" });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const importedApplicants = parseCsv(csvText);
        onApplicantsImported(importedApplicants); // Pass data back to parent
        setMessage({
          text: `Successfully imported ${importedApplicants.length} applicants!`,
          type: "success",
        });
        setFile(null); // Clear file input after successful import
      } catch (error) {
        console.error("CSV Import Error:", error);
        setMessage({ text: `Import failed: ${error.message}`, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      setMessage({ text: "Failed to read file.", type: "error" });
    };

    reader.readAsText(file); // Read the file as text
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg mt-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <UploadCloud size={20} /> Import Applicants from CSV
      </h3>
      <p className="text-blue-200 mb-4 text-sm">
        Upload a CSV file with applicant names and their weekly availability.
        Times should be in **24-hour format (HH:MM)**.
      </p>
      <p className="text-blue-200 mb-6 text-sm">
        **Format:** `Applicant Name,Monday,Tuesday,Wednesday,Thursday,Friday`
        <br />
        **Example:** `Alice
        Smith,09:00-12:00;14:00-17:00,10:00-13:00,,08:00-10:00,`
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <label className="flex-1 w-full sm:w-auto cursor-pointer bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center gap-2 border border-blue-500">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud size={20} /> Select CSV File
        </label>
        <button
          onClick={handleImport}
          disabled={!file || isLoading}
          className="flex-1 w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 border border-green-500"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Importing...
            </>
          ) : (
            <>
              <CheckCircle size={20} /> Process CSV
            </>
          )}
        </button>
      </div>

      {message.text && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-500/20 text-green-200 border border-green-400/30"
              : message.type === "error"
              ? "bg-red-500/20 text-red-200 border border-red-400/30"
              : "bg-blue-500/20 text-blue-200 border border-blue-400/30"
          }`}
        >
          {message.type === "success" && <CheckCircle size={18} />}
          {message.type === "error" && <XCircle size={18} />}
          {message.type === "info" && <Loader2 size={18} />}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default CsvImport;
