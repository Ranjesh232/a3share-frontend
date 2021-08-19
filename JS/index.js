console.log("hello");
const dropZone = document.querySelector(".drop-zone");
const inputFile = document.querySelector("#inputFile");
const browseBtn = document.querySelector(".browseBtn");
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const fileURLInput = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copyBtn");
const emailForm = document.querySelector("#emailForm");
const toast = document.querySelector(".toast");

const maxAllowedSize = 100 * 1024 * 1024; //100mb


const host = "https://a3share.herokuapp.com/";
const uploadUrl = `${host}api/files`;
const emailUrl = `${host}api/files/send`;

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    console.table(files);
    if (files.length) {
        inputFile.files = files;
        uploadFile();
    }
});

inputFile.addEventListener("change", () => {
    uploadFile();
});

browseBtn.addEventListener("click", () => {
    inputFile.click();
});

copyBtn.addEventListener("click", () => {
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link copied")
});

const resetInputFile = () => {
    inputFile.value = "";
};

const uploadFile = () => {
    if (inputFile.files.length > 1) {
        resetInputFile();
        showToast("More than 1 file not allowed");
        return;
    };
    const file = inputFile.files[0];
    if (file.size > maxAllowedSize) {
        showToast("Cannot upload more than 100mb!!!");
        resetInputFile();
        return;
    }
    progressContainer.style.display = "block";

    const formData = new FormData();
    formData.append("myfile", file);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    };

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = () => {
        resetInputFile();
        showToast(`Error in Upload: ${xhr.statusText}`);
    }

    xhr.open("POST", uploadUrl);
    xhr.send(formData);
};

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    // console.log(percent);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent / 100})`
}

const onUploadSuccess = ({ file: url }) => {
    console.log(url);
    resetInputFile();
    emailForm[2].removeAttribute("disabled");
    sharingContainer.style.display = "block";
    progressContainer.style.display = "none";
    fileURLInput.value = url;
}

emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = fileURLInput.value;
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };
    emailForm[2].setAttribute("disabled", "true");
    console.table(formData);

    fetch(emailUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    }).then((res) => res.json()).then(({ success }) => {
        if (success) {
            sharingContainer.style.display = "none";
            progressBar.style.display = "none";
            showToast("Email sent");
        }
    });
});

let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "transform(-50%,0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.transform = "transform(50%,70px)";
    }, 2000);
}
