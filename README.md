# Interview Scheduler App 🗓️

A React-based web application designed to simplify the process of scheduling interviews between an interviewer and multiple job applicants. It helps you manage interviewer availability, add applicant details, find common time slots, and generate a clear interview schedule.

Data persists locally, and you can easily import applicants from a CSV file and export the final schedule.

---

## ✨ Features

- **Interviewer Availability Setup**

  - Define the interviewer's weekly working hours (Monday to Friday).
  - Support for multiple time slots per day.

- **Applicant Management**

  - Manually add applicants with names and individual weekly availability.
  - Edit or delete existing applicants.
  - Clear all applicants at once.

- **CSV Import**

  - Upload a CSV file to quickly add multiple applicants.
  - Include names and detailed availability.

- **Automatic Schedule Generation**

  - Generates an optimal schedule based on interviewer and applicant availability.

- **Configurable Parameters**

  - Adjust interview duration (15, 30, 45, 60 minutes).
  - Choose number of interviewers (1 or 2).

- **Schedule Results View**

  - Displays matched applicants per time slot/day.
  - Lists unmatched applicants.

- **Data Persistence**

  - All data saved in browser local storage.

- **Export to CSV**
  - Download the generated schedule and unmatched applicants.

---

## 🛠️ Technologies Used

- **React** – UI framework
- **Tailwind CSS** – Utility-first styling
- **Lucide React** – Icons

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm or Yarn

### Installation

```bash
# Clone repository
git clone <your-repository-url>
cd interview-scheduler-app

# Install dependencies
npm install
# or
yarn install
```

### Run

```bash
npm start
# or
yarn start
```

The app will open at [http://localhost:3000](http://localhost:3000).

---

## 💡 Usage

The app has three main views: **Interviewer Setup**, **Manage Applicants**, and **Schedule Results**.

### 1. Interviewer Setup

- Go to the _Interviewer Setup_ tab.
- Add time slots for each weekday.
- Example: `"9:00 AM – 12:00 PM"`.
- Multiple non-contiguous slots per day supported.

### 2. Manage Applicants

- Go to the _Manage Applicants_ tab.

**Add Manually**

- Enter applicant name.
- Add availability slots for each weekday.

**Import from CSV**

- CSV header format:

  ```
  Applicant Name,Monday,Tuesday,Wednesday,Thursday,Friday
  ```

- Example row:

  ```
  Alice Smith,09:00-12:00;14:00-17:00,10:00-13:00,,08:00-10:00,13:00-16:00
  ```

- Multiple slots separated by `;`.
- Empty cells mean no availability.
- Use _Select CSV File_ → _Process CSV_ to import.

**Edit/Delete Applicants**

- Use ✏️ to edit.
- Use 🗑️ to delete.
- Click _Clear All_ to remove all.

**Generate Schedule**

- Click _Generate Schedule Matches_ → goes to Schedule Results tab.

### 3. Schedule Results

- Adjust **interview duration** (15/30/45/60 min).
- Set **number of interviewers** (1 or 2).
- View matched schedule per day.
- See list of unmatched applicants.
- Export results to CSV (`interview_schedule.csv`).
- Clear schedule without losing applicants/interviewer data.

---

## 🗑️ Clearing All Data

- Click _Clear All Data_ in the header.
- Resets interviewer, applicants, and schedule.

---

## 🛠️ File Structure

- `App.jsx` – Main component, manages state and scheduling.
- `CsvImport.jsx` – Handles CSV uploads and parsing.
- `CsvExport.jsx` – Generates downloadable CSVs.

---

## 🚀 Future Enhancements

- Conflict resolution for unmatched applicants.
- Applicant prioritization.
- Multiple interviewers with distinct availabilities.
- Support for specific date ranges (not just weekly).
- Calendar integrations (Google Calendar, etc).
- Improved error reporting for invalid CSVs.

```

```
