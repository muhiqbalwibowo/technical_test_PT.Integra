// Data siswa
const dataSiswa = [
  ["123", "Hula", "Math", "UTS", 8],
  ["123", "Hula", "Math", "UAS", 7],
  ["123", "Hula", "History", "UTS", 6],
  ["123", "Hula", "History", "UAS", 5],
  ["123", "Hula", "History", "Project", 4],
  ["456", "Bobo", "Math", "UTS", 10],
  ["456", "Bobo", "Math", "UAS", null],
  ["456", "Bobo", "History", "UTS", 6],
  ["456", "Bobo", "History", "UAS", 5],
  ["456", "Bobo", "History", "Project", null],
  ["789", "Luna", "Math", "UTS", 10],
  ["789", "Luna", "Math", "UAS", null],
  ["789", "Luna", "History", "UTS", 6],
  ["789", "Luna", "History", "UAS", 5],
  ["789", "Luna", "History", "Project", null],
];

// Fungsi untuk mengelompokkan data siswa
function processData(data) {
  const groupedData = {};

  // Mengelompokkan data berdasarkan nrp, nama, dan mata pelajaran
  data.forEach((item) => {
    const [nrp, nama, mataPelajaran, jenisTest, nilai] = item;

    if (!groupedData[nrp]) {
      groupedData[nrp] = {
        nrp,
        nama,
        mataPelajaran: {},
      };
    }

    if (!groupedData[nrp].mataPelajaran[mataPelajaran]) {
      groupedData[nrp].mataPelajaran[mataPelajaran] = {
        tests: {},
        finalScore: null,
      };
    }

    groupedData[nrp].mataPelajaran[mataPelajaran].tests[jenisTest] = nilai;
  });

  // Menghitung nilai akhir untuk setiap mata pelajaran
  Object.values(groupedData).forEach((siswa) => {
    Object.entries(siswa.mataPelajaran).forEach(([mataPelajaran, data]) => {
      if (mataPelajaran === "Math") {
        // Untuk Math, finalScore = (UTS + UAS) / 2
        const uts = data.tests["UTS"] || 0;
        const uas = data.tests["UAS"] || 0;
        data.finalScore = (uts + uas) / 2;
      } else if (mataPelajaran === "History") {
        // Untuk History, finalScore = (0.4 * UTS) + (0.4 * UAS) + (0.2 * Project)
        const uts = data.tests["UTS"] || 0;
        const uas = data.tests["UAS"] || 0;
        const project = data.tests["Project"] || 0;
        data.finalScore = (uts + uas + project) / 3;

        // Pembulatan dengan satu angka di belakang koma
        data.finalScore = Math.round(data.finalScore * 10) / 10;
      }
    });
  });

  // Menghitung median untuk setiap siswa
  Object.values(groupedData).forEach((siswa) => {
    const nilaiArray = [];

    // Mengumpulkan semua nilai test dari siswa
    Object.values(siswa.mataPelajaran).forEach((data) => {
      Object.values(data.tests).forEach((nilai) => {
        if (nilai !== null) {
          nilaiArray.push(nilai);
        }
      });
    });

    // Mengurutkan nilai
    nilaiArray.sort((a, b) => a - b);

    // Menghitung median
    let median;
    if (nilaiArray.length === 0) {
      median = "-";
    } else if (nilaiArray.length % 2 === 0) {
      // Jumlah nilai genap
      const mid1 = nilaiArray[nilaiArray.length / 2 - 1];
      const mid2 = nilaiArray[nilaiArray.length / 2];
      median = (mid1 + mid2) / 2;
    } else {
      // Jumlah nilai ganjil
      median = nilaiArray[Math.floor(nilaiArray.length / 2)];
    }

    siswa.median = median;
  });

  return groupedData;
}

// Fungsi untuk membuat tabel HTML
function renderTable(processedData) {
  const tableBody = document.getElementById("tabel-nilai");
  tableBody.innerHTML = "";

  Object.values(processedData).forEach((siswa) => {
    const mataPelajaranList = Object.keys(siswa.mataPelajaran);
    const totalRowspan = mataPelajaranList.reduce((total, mataPelajaran) => {
      const testsCount = Object.keys(
        siswa.mataPelajaran[mataPelajaran].tests
      ).length;
      return total + testsCount;
    }, 0);

    let isFirstRow = true;

    mataPelajaranList.forEach((mataPelajaran) => {
      const mataPelajaranData = siswa.mataPelajaran[mataPelajaran];
      const tests = Object.entries(mataPelajaranData.tests);
      const testsCount = tests.length;

      tests.forEach(([jenisTest, nilai], testIndex) => {
        const row = document.createElement("tr");

        // NRP dan Nama hanya ditampilkan pada baris pertama
        if (isFirstRow) {
          const nrpCell = document.createElement("td");
          nrpCell.rowSpan = totalRowspan;
          nrpCell.textContent = siswa.nrp;
          row.appendChild(nrpCell);

          const namaCell = document.createElement("td");
          namaCell.rowSpan = totalRowspan;
          namaCell.textContent = siswa.nama;
          row.appendChild(namaCell);

          isFirstRow = false;
        }

        // Mata Pelajaran ditampilkan sekali untuk setiap grup test
        if (testIndex === 0) {
          const mataPelajaranCell = document.createElement("td");
          mataPelajaranCell.rowSpan = testsCount;
          mataPelajaranCell.textContent = mataPelajaran;
          row.appendChild(mataPelajaranCell);
        }

        // Jenis Test
        const jenisTestCell = document.createElement("td");
        jenisTestCell.textContent = jenisTest;
        row.appendChild(jenisTestCell);

        // Nilai Test
        const nilaiCell = document.createElement("td");
        nilaiCell.textContent = nilai !== null ? nilai : "-";

        // Cek jika nilai test score kurang dari final score
        if (nilai !== null && nilai < mataPelajaranData.finalScore) {
          nilaiCell.style.color = "red"; // Ubah warna font menjadi merah
        }

        row.appendChild(nilaiCell);

        // Final Score ditampilkan sekali untuk setiap mata pelajaran
        if (testIndex === 0) {
          const finalScoreCell = document.createElement("td");
          finalScoreCell.rowSpan = testsCount;
          finalScoreCell.textContent = mataPelajaranData.finalScore;
          row.appendChild(finalScoreCell);
        }

        // Median ditampilkan sekali untuk setiap mata pelajaran (hanya pada baris pertama)
        if (testIndex === 0 && mataPelajaran === mataPelajaranList[0]) {
          const medianCell = document.createElement("td");
          medianCell.rowSpan = totalRowspan;
          medianCell.textContent = siswa.median;
          row.appendChild(medianCell);
        }

        tableBody.appendChild(row);
      });
    });
  });
}

// Proses data dan render tabel
const processedData = processData(dataSiswa);
renderTable(processedData);
