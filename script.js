const seatsGrid = document.getElementById('seatsGrid');
const totalAmountElement = document.getElementById('totalAmount');
const amountSeats = document.getElementById('amount-seats');
const completeBtn = document.getElementById('completeBtn');
const apiURL = "https://jsonplaceholder.typicode.com/users";

let selectedSeats = JSON.parse(localStorage.getItem('selectedSeats')) || []; // LocalStorage'dan yükle
const maxSeats = 3; // Maksimum seçilebilecek koltuk sayısı
const seatPrice = 1000; // Her bir koltuk ücreti

// Koltuk oluşturma fonksiyonu
async function createSeats() {
    const response = await fetch(apiURL);
    const users = await response.json();

    for (let i = 1; i <= 76; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat-icon');
        seat.dataset.seatNumber = i; // Koltuk numarasını sakla

        // Koltuk durumu
        if (i <= 10) {
            seat.classList.add('full');
            const tooltip = document.createElement('div');
            tooltip.classList.add('tooltip');
            tooltip.innerText = `Koltuk: ${i}\n${users[i % users.length].name}`;
            seat.appendChild(tooltip);
        } else {
            // Koltuğun localStorage'da seçili olup olmadığını kontrol et
            if (selectedSeats.includes(i.toString())) {
                seat.classList.add('selected'); // Renk değişimini sağlayan sınıf
            } else {
                seat.classList.add('empty'); // Boş koltuk
            }

            seat.addEventListener('click', () => selectSeat(seat));
        }

        seatsGrid.appendChild(seat);
    }

    updateTotalAmount(); // Sayfa yüklendiğinde toplam tutarı güncelle
}

let lastActionTime = Date.now(); // İlk işlem zamanını kaydediyoruz
let warningShown = false; // Uyarı gösterildi mi kontrolü

const SEAT_TIMEOUT = 30000; // 30 saniye
let warningTimeout; // Uyarı zamanlayıcısı

// Koltuk seçimi işlemi
function selectSeat(seat) {
    const seatNumber = seat.dataset.seatNumber;

    if (seat.classList.contains('selected')) {
        seat.classList.remove('selected'); // Seçim kaldırılırsa renk geri alınır
        seat.classList.add('empty'); // Tekrar boş olarak görünmesi sağlanır
        selectedSeats = selectedSeats.filter(num => num !== seatNumber);
    } else {
        if (selectedSeats.length >= maxSeats) {
            alert('En fazla 3 koltuk seçebilirsiniz!');
            return;
        }
        seat.classList.remove('empty'); // Boş sınıfı kaldırılır
        seat.classList.add('selected'); // Seçilen sınıfı eklenir
        selectedSeats.push(seatNumber);
    }

    updateTotalAmount();
    saveSeatsToStorage();
}

// 30 saniyelik zamanlayıcı başlatma
function resetInactivityTimer() {
    lastActionTime = Date.now(); // Son işlem zamanını güncelle
    if (warningShown) {
        clearTimeout(warningTimeout); // Önceden set edilmiş uyarıyı temizle
        warningShown = false; // Uyarı durumunu sıfırla
    }

    // Eğer 30 saniye boyunca hiçbir işlem yapılmazsa uyarıyı göster
    warningTimeout = setTimeout(() => {
        if (Date.now() - lastActionTime >= SEAT_TIMEOUT) {
            warningShown = true;
            if (confirm("İşleme devam etmek istiyor musunuz?")) {
                resetInactivityTimer(); // Kullanıcı devam etmek istiyorsa zamanlayıcıyı sıfırla
            } else {
                location.reload(); // Eğer 30 saniye sonra devam edilmezse sayfayı yenile
            }
        }
    }, SEAT_TIMEOUT);
}

// Sayfa yüklenirken zamanlayıcıyı başlatıyoruz
resetInactivityTimer();

// Toplam ücreti güncelle
function updateTotalAmount() {
    const totalAmount = selectedSeats.length * seatPrice;
    amountSeats.textContent = selectedSeats.length + 'x'
    totalAmountElement.textContent = totalAmount.toLocaleString(); // Ücreti formatlı göster
    // total-seats class'ına sahip div'in içine seçilen koltuk numaralarını yazdır
    const totalSeatsContainer = document.querySelector('.total-seats');
    totalSeatsContainer.innerHTML = ''; // Önceki içerikleri temizle

    // Seçilen koltukları liste olarak ekle
    selectedSeats.forEach(seat => {
        const seatDiv = document.createElement('div');
        seatDiv.classList.add('seat-icon', 'selected');
        seatDiv.style.marginBottom = '2px'; // Margin ekle
        seatDiv.style.marginRight = '18px'; // Margin ekle
        seatDiv.style.padding = '12px 8px'; // Margin ekle
        seatDiv.style.display = 'flex'; // Margin ekle
        seatDiv.style.justifyContent = 'center'; // Margin ekle
        seatDiv.style.alignItems = 'center'; // Margin ekle
        seatDiv.innerText = seat; // Koltuk numarasını yazdır
        totalSeatsContainer.appendChild(seatDiv); // total-seats container'ına ekle
    });
}

// Seçilen koltukları Local Storage'a kaydet
function saveSeatsToStorage() {
    localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
}

// Form Kontrolü
function validateForm() {
    const panels = document.querySelectorAll('.panel');
    for (let panel of panels) {
        const inputs = panel.querySelectorAll('input, select');
        for (let input of inputs) {
            if (!input.value) {
                alert('Lütfen tüm alanları doldurunuz!');
                return false;
            }
        }
    }
    return true;
}

// İşlemleri Tamamla Butonu
completeBtn.addEventListener('click', () => {
    if (selectedSeats.length === 0) {
        alert('Lütfen en az bir koltuk seçiniz!');
        return;
    }

    if (!validateForm()) {
        return; // Form geçerli değilse işlemi durdur
    }

    alert('İşlemler başarıyla tamamlandı!');
});

createSeats();

// Accordion mantığı
const accordions = document.querySelectorAll('.accordion');

accordions.forEach(acc => {
    acc.addEventListener('click', function () {
        // Aktif class ekle/kaldır
        this.classList.toggle('active');

        // Paneli göster/gizle
        const panel = this.nextElementSibling;
        if (panel.style.display === 'flex') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'flex';
        }
    });
});

// Rezervasyonu Tamamlama
document.getElementById('completeReservation').addEventListener('click', function () {
    // Form kontrolü (İsim, soyisim, telefon numarası vb. boş olmamalı)
    const allInputs = document.querySelectorAll('.panel input, .panel select');
    let formValid = true;

    allInputs.forEach(input => {
        if (input.type !== 'checkbox' && !input.value) {
            formValid = false;
            alert(`${input.previousElementSibling.innerText} boş olamaz!`);
            return;
        }
    });

    // Koltuk seçimi kontrolü
    if (selectedSeats.length === 0) {
        alert('Lütfen en az bir koltuk seçin.');
        return;
    }

    if (formValid) {
        // Rezervasyon başarılı uyarısı
        alert(`Rezervasyon başarıyla tamamlandı!\nSeçilen Koltuklar: ${selectedSeats.join(', ')}\nToplam Ücret: ${selectedSeats.length * 1000} TL`);
        // İşlem tamamlandığında yerleri sıfırla
        selectedSeats = [];
        saveSeatsToStorage();
        updateTotalAmount();
        // Koltukları ve formu sıfırla
        clearForm();
    }
});

function clearForm() {
    // Tüm form alanlarını temizle
    document.querySelectorAll('.panel input, .panel select').forEach(input => input.value = '');
    // Tüm koltukları boşalt
    const allSeats = document.querySelectorAll('.seat-icon');
    allSeats.forEach(seat => {
        seat.classList.remove('selected');
        seat.classList.add('empty');
    });
}

// Input alanlarını kaydetmek için bir fonksiyon
let userInputs = {}; // User inputları tutmak için bir nesne
function saveInputsToStorage() {
    const inputs = document.querySelectorAll('input, select'); // input ve select öğelerini seç
    inputs.forEach(input => {
        // Her input alanının id'sine göre değerini kaydediyoruz
        userInputs[input.id] = input.value;
    });
    localStorage.setItem('userInputs', JSON.stringify(userInputs)); // Tüm input verisini localStorage'a kaydediyoruz
}

// Sayfa yüklendiğinde input verilerini localStorage'dan alıp yüklemek
function loadInputsFromStorage() {
    const savedInputs = JSON.parse(localStorage.getItem('userInputs')) || {}; // localStorage'dan kaydedilmiş veriyi al
    Object.keys(savedInputs).forEach(inputId => {
        const inputElement = document.getElementById(inputId); // input elementini id'sine göre bul
        if (inputElement) {
            inputElement.value = savedInputs[inputId]; // input elementinin değerini localStorage'dan alıp ata
        }
    });
}

// Sayfa yüklendiğinde input verilerini yükle
loadInputsFromStorage();

document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('change', saveInputsToStorage);
});