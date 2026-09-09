// NCA Parking JS build: 20260909-07

// زر النزول السريع لأسفل الصفحة
      function setupScrollBottomButton() {
        const downBtn = document.getElementById("scrollToBottomBtn");
        const upBtn = document.getElementById("scrollToTopBtn");

        if (!downBtn && !upBtn) return;

        const updateVisibility = () => {
          const pageHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
          );

          const scrollTop =
            window.scrollY ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;

          const nearTop = scrollTop < 320;

          const nearBottom =
            window.innerHeight + scrollTop >= pageHeight - 180;

          const modalOpen =
            document.body.classList.contains("modal-open");

          // سهم النزول:
          // يظهر ما دام المستخدم ليس قرب نهاية الصفحة.
          if (downBtn) {
            downBtn.classList.toggle(
              "hidden",
              nearBottom || modalOpen
            );
          }

          // سهم الصعود:
          // لا يظهر في أعلى الصفحة، ويظهر بعد النزول.
          if (upBtn) {
            upBtn.classList.toggle(
              "hidden",
              nearTop || modalOpen
            );
          }
        };

        if (downBtn) {
          downBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            const pageHeight = Math.max(
              document.body.scrollHeight,
              document.documentElement.scrollHeight
            );

            window.scrollTo({
              top: pageHeight,
              behavior: "smooth"
            });
          });
        }

        if (upBtn) {
          upBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });
          });
        }

        window.addEventListener(
          "scroll",
          updateVisibility,
          { passive: true }
        );

        window.addEventListener(
          "resize",
          updateVisibility
        );

        // بعد تغيير الصفحة بين الرئيسية و"سياراتي"
        // نعيد حساب مكان الأزرار.
        document.addEventListener(
          "nca-page-changed",
          updateVisibility
        );

        updateVisibility();
      }


      // استبدل هذه القيم ببيانات مشروعك في Supabase
      const SUPABASE_URL = "https://wqdbkivyyptjryvfdydl.supabase.co";
      const SUPABASE_ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxZGJraXZ5eXB0anJ5dmZkeWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MDY0NjEsImV4cCI6MjA4NjI4MjQ2MX0.v0DwW0wcgqmpalOyLxi3sz_uJ7OQtUGNoOwPzU6zN7w";

      // إنشاء عميل Supabase
      // يرسل معرف الجهاز المخزن محليًا مع كل طلب إلى Supabase
      // حتى تستطيع سياسات RLS التحقق من ملكية السيارة عند التعديل أو التعطيل.
      const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
          global: {
            fetch: async (url, options = {}) => {
              const headers = new Headers(options.headers || {});

              const currentDeviceId =
                localStorage.getItem("parking_device_id");

              if (currentDeviceId) {
                headers.set("x-device-id", currentDeviceId);
              }

              return fetch(url, {
                ...options,
                headers,
              });
            },
          },
        },
      );


// =========================================================
// عداد المركبات في أعلى الصفحة
// =========================================================

async function updateHeaderCarCounter() {
  const counter = document.getElementById("headerCarCounter");
  const countEl = document.getElementById("headerCarsCount");
  if (!counter || !countEl) return;

  counter.classList.add("loading");

  try {
    const { count, error } = await supabaseClient
      .from("cars")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    if (error) throw error;

    countEl.textContent = Number(count || 0).toLocaleString("ar-SA");
    counter.title = `عدد المركبات النشطة المسجلة: ${Number(count || 0).toLocaleString("ar-SA")}`;
  } catch (error) {
    console.warn("تعذر تحديث عداد المركبات في الرأس:", error);
    countEl.textContent = "—";
    counter.title = "تعذر جلب عدد المركبات حاليًا";
  } finally {
    counter.classList.remove("loading");
  }
}


      // معرف المستخدم المحلي
      let deviceId = null;
      let isAdmin = false;
      let carToDelete = null;
      let carImageData = null;
      let currentPage = "home";
      let isDarkMode = false;


      // القائمة الجانبية الاحترافية
      function setupSiteMenu() {
        const toggle = document.getElementById("siteMenuToggle");
        const close = document.getElementById("siteMenuClose");
        const panel = document.getElementById("siteMenuPanel");
        const backdrop = document.getElementById("siteMenuBackdrop");

        if (!toggle || !close || !panel || !backdrop) return;

        function openMenu() {
          toggle.classList.add("active");
          toggle.setAttribute("aria-expanded", "true");
          panel.classList.add("active");
          panel.setAttribute("aria-hidden", "false");
          backdrop.classList.add("active");
          document.body.classList.add("menu-open");
        }

        function closeMenu() {
          toggle.classList.remove("active");
          toggle.setAttribute("aria-expanded", "false");
          panel.classList.remove("active");
          panel.setAttribute("aria-hidden", "true");
          backdrop.classList.remove("active");
          document.body.classList.remove("menu-open");
        }

        toggle.addEventListener("click", () => {
          if (panel.classList.contains("active")) closeMenu();
          else openMenu();
        });

        close.addEventListener("click", closeMenu);
        backdrop.addEventListener("click", closeMenu);

        panel.querySelectorAll("a").forEach((link) => {
          link.addEventListener("click", () => {
            closeMenu();
          });
        });

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") closeMenu();
        });
      }

      function setupAdminMenuTools() {
        const loginBtn = document.getElementById("siteMenuAdminLoginBtn");
        const testBtn = document.getElementById("siteMenuTestConnectionBtn");
        const resetBtn = document.getElementById("siteMenuResetBtn");
        const logoutBtn = document.getElementById("siteMenuLogoutBtn");

        if (loginBtn) loginBtn.addEventListener("click", () => {
          if (!isAdmin) {
            closeSiteMenuSafely();
            showModal("adminLoginModal");
            setTimeout(() => document.getElementById("adminEmail")?.focus(), 100);
          }
        });
        if (testBtn) testBtn.addEventListener("click", async () => { closeSiteMenuSafely(); await testConnection(); });
        if (resetBtn) resetBtn.addEventListener("click", () => { closeSiteMenuSafely(); if (isAdmin && confirm("⚠️ أنت مدير النظام. هل أنت متأكد من تصفير جميع البيانات؟")) resetAllData(); });
        if (logoutBtn) logoutBtn.addEventListener("click", async () => { closeSiteMenuSafely(); await adminLogout(); });
      }

      function closeSiteMenuSafely() {
        const close = document.getElementById("siteMenuClose");
        const toggle = document.getElementById("siteMenuToggle");
        if (close) close.click(); else if (toggle?.classList.contains("active")) toggle.click();
      }

      // تهيئة التطبيق
      document.addEventListener("DOMContentLoaded", async function () {
        console.log("بدء تشغيل نظام مواقف السيارات");

        // تحميل إعدادات الوضع الليلي من التخزين المحلي
        loadThemeSettings();

        // تهيئة معرف الجهاز
        initializeDeviceId();

        await initializeAdminAuth();

        setupSiteMenu();
        setupAdminMenuTools();

        setupScrollBottomButton();

        // إعداد المستمعين للأحداث
        setupEventListeners();

        // تحميل السيارات عند بدء التشغيل
        await loadCars();
        await updateHeaderCarCounter();

        // التحقق من وجود سيارات مسجلة من هذا الجهاز
        checkMyCars();

        // تحديث عناصر تحكم المدير
        updateAdminDots();
      });

      // تحميل إعدادات الوضع الليلي من التخزين المحلي
      function loadThemeSettings() {
        const savedTheme = localStorage.getItem("parking_theme");

        if (savedTheme === "dark" || (!savedTheme && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
          isDarkMode = true;
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          isDarkMode = false;
          document.documentElement.setAttribute("data-theme", "light");
        }

        updateThemeUI();
      }

      // حفظ إعدادات الوضع الليلي في التخزين المحلي
      function saveThemeSettings() {
        localStorage.setItem("parking_theme", isDarkMode ? "dark" : "light");
      }

      // تبديل الوضع الليلي/الفاتح
      function toggleTheme() {
        isDarkMode = !isDarkMode;

        if (isDarkMode) {
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          document.documentElement.setAttribute("data-theme", "light");
        }

        saveThemeSettings();
        updateThemeUI();
      }

      // تحديث واجهة المستخدم حسب الوضع الحالي
      function updateThemeUI() {
        const themeBtn = document.getElementById("themeToggleBtn");

        if (isDarkMode) {
          themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
          themeBtn.setAttribute("aria-label", "تفعيل الوضع الفاتح");
          themeBtn.setAttribute("title", "التحويل إلى الوضع الفاتح");
        } else {
          themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
          themeBtn.setAttribute("aria-label", "تفعيل الوضع الليلي");
          themeBtn.setAttribute("title", "التحويل إلى الوضع الليلي");
        }

        // تحديث لون العنوان في الصفحة الرئيسية
        const pageTitle = document.querySelector("#home h1");
        if (pageTitle) {
          pageTitle.style.color = "var(--accent-blue)";
        }

        const myCarsTitle = document.querySelector("#myCarsPage h2");
        if (myCarsTitle) {
          myCarsTitle.style.color = "var(--accent-blue)";
        }
      }

      // تهيئة معرف الجهاز
      function initializeDeviceId() {
        deviceId = localStorage.getItem("parking_device_id");

        if (!deviceId) {
          // إنشاء معرف فريد للجهاز
          deviceId =
            "device_" +
            Date.now() +
            "_" +
            Math.random().toString(36).substr(2, 9);
          localStorage.setItem("parking_device_id", deviceId);
          console.log("✅ تم إنشاء معرف جهاز جديد:", deviceId);
        } else {
          console.log("✅ تم تحميل معرف الجهاز:", deviceId);
        }
      }

      // إعداد المستمعين للأحداث
      function setupEventListeners() {
        // أزرار إضافة سيارة
        document
          .getElementById("addCarBtn")
          .addEventListener("click", () => addNewCar());
        document
          .getElementById("welcomeAddCarBtn")
          .addEventListener("click", () => addNewCar());

        // زر سياراتي
        document
          .getElementById("myCarsBtn")
          .addEventListener("click", () => showMyCars());

        document
          .getElementById("backHomeBtn")
          .addEventListener("click", () => showPage("home"));

        // زر تبديل الوضع الليلي
        document
          .getElementById("themeToggleBtn")
          .addEventListener("click", toggleTheme);

        // تسجيل دخول المدير
        document
          .getElementById("adminLoginForm")
          .addEventListener("submit", async (e) => {
            e.preventDefault();
            await adminLogin();
          });

        // إضافة/تعديل سيارة
        document
          .getElementById("carForm")
          .addEventListener("submit", async (e) => {
            e.preventDefault();
            await saveCar();
          });

        // البحث
        document
          .getElementById("searchBtn")
          .addEventListener("click", performSearch);
        document
          .getElementById("searchInput")
          .addEventListener("keyup", (e) => {
            if (e.key === "Enter") performSearch();
          });

        // زر التحديث: إلغاء البحث وإظهار جميع السيارات من جديد
        document
          .getElementById("refreshCarsBtn")
          .addEventListener("click", refreshCarsList);

        // تأكيد الحذف
        document
          .getElementById("confirmDeleteBtn")
          .addEventListener("click", async () => {
            await deleteCar(carToDelete);
          });

        // إعداد مستمعين للصورة
        setupImageUploadListeners();
      }

      // دالة لإظهار/إخفاء نقطتي التحكم بناءً على حالة المدير
      function updateAdminDots() {
        const adminDots = document.getElementById("adminDots");
        const adminIndicator = document.getElementById("adminModeIndicator");
        const adminTools = document.getElementById("siteMenuAdminTools");
        const adminLoginBtn = document.getElementById("siteMenuAdminLoginBtn");
        if (adminDots) adminDots.style.display = "none";
        if (adminIndicator) adminIndicator.classList.toggle("active", isAdmin);
        if (adminTools) adminTools.hidden = !isAdmin;
        if (adminLoginBtn) adminLoginBtn.hidden = isAdmin;
      }

      function showResetDot() {
        const adminTools = document.getElementById("siteMenuAdminTools");
        if (adminTools) adminTools.hidden = !isAdmin;
      }

      // دالة لإظهار نقطة تصفير البيانات فقط للمدير
            // اختبار الاتصال بقاعدة البيانات
      async function testConnection() {
        try {
          console.log("🔍 اختبار الاتصال بـ Supabase...");

          // محاولة الاتصال بالجدول
          const { data, error } = await supabaseClient
            .from("cars")
            .select("count", { count: "exact", head: true });

          if (error) {
            console.error("❌ خطأ في الاتصال:", error);
            if (isAdmin) {
              showAlert(
                "mainAlert",
                `❌ خطأ في الاتصال بقاعدة البيانات: ${error.message}`,
                "danger",
              );
            }
          } else {
            console.log("✅ الاتصال ناجح");
            if (isAdmin) {
              showAlert(
                "mainAlert",
                "✅ الاتصال بقاعدة البيانات ناجح",
                "success",
              );
            }
          }
        } catch (error) {
          console.error("❌ خطأ غير متوقع:", error);
          if (isAdmin) {
            showAlert(
              "mainAlert",
              `❌ خطأ غير متوقع: ${error.message}`,
              "danger",
            );
          }
        }
      }

      // دالة لتصفير البيانات (للتجربة فقط)
      async function resetAllData() {
        if (
          !confirm(
            "⚠️ تحذير: هذا سيحذف جميع البيانات في قاعدة البيانات. هل أنت متأكد؟",
          )
        ) {
          return;
        }

        try {
          console.log("🗑️ جاري تصفير جميع البيانات...");

          // حذف جميع السيارات
          const { error } = await supabaseClient
            .from("cars")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

          if (error) {
            console.error("❌ خطأ في تصفير البيانات:", error);
            showAlert(
              "mainAlert",
              "❌ فشل في تصفير البيانات: " + error.message,
              "danger",
            );
            return;
          }

          console.log("✅ تم تصفير جميع البيانات");
          showAlert("mainAlert", "✅ تم تصفير جميع البيانات بنجاح", "success");

          // تحديث الواجهة
          setTimeout(() => {
            loadCars();
            checkMyCars();
          }, 1000);
        } catch (error) {
          console.error("❌ خطأ غير متوقع في تصفير البيانات:", error);
          showAlert(
            "mainAlert",
            "❌ حدث خطأ غير متوقع: " + error.message,
            "danger",
          );
        }
      }

      // إعداد مستمعين لرفع الصور
      function setupImageUploadListeners() {
        const uploadArea = document.getElementById("imageUploadArea");
        const fileInput = document.getElementById("carImage");

        if (!uploadArea || !fileInput) return;

        // حدث السحب والإفلات
        uploadArea.addEventListener("dragover", (e) => {
          e.preventDefault();
          uploadArea.classList.add("dragover");
        });

        uploadArea.addEventListener("dragleave", () => {
          uploadArea.classList.remove("dragover");
        });

        uploadArea.addEventListener("drop", (e) => {
          e.preventDefault();
          uploadArea.classList.remove("dragover");

          if (e.dataTransfer.files.length) {
            handleImageFile(e.dataTransfer.files[0]);
          }
        });

        // حدث اختيار الملف
        fileInput.addEventListener("change", (e) => {
          if (e.target.files.length) {
            handleImageFile(e.target.files[0]);
          }
        });
      }

      // معالجة ملف الصورة (بدون قيود على الحجم)
      function handleImageFile(file) {
        // التحقق من نوع الملف فقط
        if (!file.type.startsWith("image/")) {
          alert(
            "❌ الرجاء اختيار ملف صورة فقط\nيجب أن يكون الملف من نوع: JPG, PNG, GIF, WebP, etc.",
          );
          return;
        }

        console.log("📸 معلومات الملف:");
        console.log("- الاسم:", file.name);
        console.log("- النوع:", file.type);
        console.log("- الحجم:", (file.size / (1024 * 1024)).toFixed(2), "MB");

        // التحذير إذا كان الملف كبيراً جداً (أكبر من 20MB)
        if (file.size > 20 * 1024 * 1024) {
          if (
            !confirm(
              `⚠️ تحذير: هذه الصورة كبيرة جداً (${(file.size / (1024 * 1024)).toFixed(1)} MB)\nقد تستغرق وقتاً طويلاً في الرفع.\nهل تريد المتابعة؟`,
            )
          ) {
            return;
          }
        }

        const reader = new FileReader();

        reader.onload = function (e) {
          carImageData = e.target.result;
          displayImagePreview(carImageData, {
            name: file.name,
            size: file.size,
            type: file.type,
          });

          const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
          console.log(`✅ تم تحميل الصورة: ${file.name} (${sizeInMB} MB)`);
        };

        reader.onerror = function (e) {
          console.error("❌ خطأ في قراءة الملف:", e);
          alert(
            "❌ حدث خطأ في قراءة الملف.\nقد يكون الملف تالفاً أو كبيراً جداً.\nحاول بملف آخر.",
          );
        };

        reader.readAsDataURL(file);
      }

      // عرض معاينة الصورة مع معلومات الملف
      function displayImagePreview(imageData, fileInfo = null) {
        const previewDiv = document.getElementById("imagePreview");
        const fileInfoDiv = document.getElementById("fileInfo");

        previewDiv.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <img src="${imageData}" class="image-preview" alt="معاينة صورة السيارة">
            <button type="button" class="remove-image-btn" onclick="removeImage()">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;

        // عرض معلومات الملف إذا كانت متوفرة
        if (fileInfo) {
          const sizeInMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
          fileInfoDiv.innerHTML = `
            <div style="background: var(--hover-bg); padding: 8px; border-radius: 5px; margin-top: 5px;">
              <div><strong>اسم الملف:</strong> ${fileInfo.name}</div>
              <div><strong>الحجم:</strong> ${sizeInMB} MB</div>
              <div><strong>النوع:</strong> ${fileInfo.type}</div>
            </div>
          `;
        } else {
          fileInfoDiv.innerHTML = "";
        }
      }

      // إزالة الصورة
      function removeImage() {
        carImageData = null;
        document.getElementById("imagePreview").innerHTML = "";
        document.getElementById("fileInfo").innerHTML = "";
        document.getElementById("carImage").value = "";
        console.log("🗑️ تم إزالة الصورة");
      }

      // دالة لضغط الصورة تلقائياً إذا كانت كبيرة جداً
      async function compressImage(imageData, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve) => {
          const img = new Image();

          img.onload = function () {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            // تقليل الأبعاد إذا كانت الصورة كبيرة
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // تحويل إلى JPG مع جودة أقل
            const compressedData = canvas.toDataURL("image/jpeg", quality);

            const originalSize = imageData.length / 1024;
            const compressedSize = compressedData.length / 1024;
            const reduction = (
              ((originalSize - compressedSize) / originalSize) *
              100
            ).toFixed(1);

            console.log(
              `📉 تم ضغط الصورة: ${originalSize.toFixed(1)}KB → ${compressedSize.toFixed(1)}KB (تخفيض ${reduction}%)`,
            );

            resolve(compressedData);
          };

          img.onerror = function () {
            console.error("❌ فشل في تحميل الصورة للضغط");
            resolve(null);
          };

          img.src = imageData;
        });
      }

      // رفع الصورة إلى Supabase Storage (بدون قيود حجم)
      async function uploadImageToStorage(imageData, plateNumber) {
        try {
          console.log("📤 بدء رفع الصورة...");

          // استخراج البيانات من Base64
          const base64Data = imageData.split(",")[1];
          const matches = imageData.match(/^data:(image\/\w+);base64,/);
          const mimeType = matches ? matches[1] : "image/jpeg";
          const fileExt = mimeType.split("/")[1] || "jpg";

          // إنشاء اسم ملف فريد
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 8);
          const fileName = `car_${plateNumber.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}_${randomStr}.${fileExt}`;

          console.log("📁 اسم الملف:", fileName);
          console.log("🎨 نوع الملف:", mimeType);

          // تحويل Base64 إلى Blob
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });

          // حساب حجم الملف
          const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
          console.log(`📊 حجم الملف للرفع: ${fileSizeMB} MB`);

          // رفع الملف مع إعدادات متقدمة
          console.log("⬆️ جاري رفع الملف...");
          const { data, error } = await supabaseClient.storage
            .from("car-images")
            .upload(fileName, blob, {
              cacheControl: "86400", // 24 ساعة
              upsert: false,
              contentType: mimeType,
            });

          if (error) {
            console.error("❌ خطأ في رفع الصورة:", error);

            // إذا كان الخطأ بسبب الحجم، إعادة المحاولة بـ compressImage
            if (
              error.message.includes("too large") ||
              error.message.includes("size") ||
              error.message.includes("limit")
            ) {
              console.log("⚠️ الملف كبير جداً، جاري ضغط الصورة...");
              const compressedImage = await compressImage(imageData);
              if (compressedImage) {
                return await uploadImageToStorage(compressedImage, plateNumber);
              }
            }

            console.log("⚠️ تم تخطي رفع الصورة، استمر بدون صورة");
            return null;
          }

          console.log("✅ تم رفع الصورة بنجاح:", data);

          // الحصول على رابط عام
          const {
            data: { publicUrl },
          } = supabaseClient.storage.from("car-images").getPublicUrl(fileName);

          console.log("🔗 رابط الصورة العامة:", publicUrl);
          return publicUrl;
        } catch (error) {
          console.error("❌ خطأ غير متوقع في رفع الصورة:", error);
          // في حالة الخطأ، استمر بدون صورة
          return null;
        }
      }

      // تحميل السيارات
      async function loadCars() {
        try {
          const { data, error } = await supabaseClient
            .from("cars")
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false });

          if (error) throw error;

          displayCars(data || []);
          updateHeaderCarCounter();
        } catch (error) {
          console.error("خطأ في تحميل السيارات:", error);
          document.getElementById("carsContainer").innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ffc107;"></i>
                        <h3>حدث خطأ في تحميل السيارات</h3>
                        <p>${error.message || "يرجى التحقق من اتصال الإنترنت"}</p>
                    </div>
                `;
        }
      }

      // عرض السيارات
      function displayCars(cars) {
        const container = document.getElementById("carsContainer");

        if (cars.length === 0) {
          container.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                        <i class="fas fa-car" style="font-size: 3rem; color: #ccc;"></i>
                        <h3 style="color: var(--text-secondary);">لا توجد سيارات مسجلة بعد</h3>
                        <p style="color: var(--text-secondary);">كن أول من يسجل سيارته!</p>
                    </div>
                `;
          return;
        }

        container.innerHTML = cars
          .map((car) => {
            const isMyCar = car.device_id === deviceId;
            const canEdit = isMyCar || isAdmin;

            // تنظيف النص لمنع مشاكل في JavaScript
            const safeOwnerName = car.owner_name.replace(/'/g, "\\'");
            const safePlateNumber = car.plate_number.replace(/'/g, "\\'");
            const safePhoneNumber = car.phone_number.replace(/'/g, "\\'");

            return `
                <div class="car-card">
                    ${isMyCar ? '<div class="my-car-badge"><i class="fas fa-check-circle"></i> سيارتي</div>' : ""}
                    <div class="car-header">
                        <h3>${car.car_model}</h3>
                        <p>${car.plate_number}</p>
                    </div>
                    <div class="car-body">
                        ${
                          car.car_image
                            ? `
                        <div style="text-align: center; margin-bottom: 15px;">
                            <img src="${car.car_image}" 
                                 style="max-width: 100%; max-height: 150px; border-radius: 8px; border: 1px solid var(--border-color);"
                                 alt="صورة سيارة ${car.plate_number}"
                                 onerror="this.style.display='none'">
                        </div>
                        `
                            : ""
                        }
                        
                        <div class="car-info">
                            <h3><i class="fas fa-user"></i> صاحب السيارة</h3>
                            <p>${car.owner_name}</p>
                        </div>
                        
                        <div class="car-info">
                            <h3><i class="fas fa-palette"></i> اللون</h3>
                            <p>${car.car_color}</p>
                        </div>
                        
                        <div class="car-info">
                            <h3><i class="fas fa-phone"></i> رقم الهاتف</h3>
                            <p>${car.phone_number}</p>
                        </div>
                        
                        <div class="car-info">
                            <h3><i class="fas fa-graduation-cap"></i> مجال التدريب</h3>
                            <p>${car.training_field}</p>
                        </div>
                        
                        <div class="car-actions">
                            <button
                                class="btn btn-primary contact-action-btn"
                                type="button"
                                onclick="contactOwner('${safePhoneNumber}', '${safeOwnerName}')"
                                aria-label="الاتصال بصاحب السيارة ${safeOwnerName}"
                                title="اتصال هاتفي"
                            >
                                <i class="fas fa-phone-alt"></i> اتصل
                            </button>

                            <button
                                class="btn btn-whatsapp contact-action-btn"
                                type="button"
                                onclick="whatsappOwner('${safePhoneNumber}', '${safeOwnerName}', '${safePlateNumber}')"
                                aria-label="التواصل مع صاحب السيارة ${safeOwnerName} عبر واتساب"
                                title="مراسلة عبر واتساب"
                            >
                                <i class="fab fa-whatsapp"></i> واتساب
                            </button>
${
                              canEdit
                                ? `
                            <button class="btn btn-warning" onclick="editCar('${car.id}')">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            `
                                : ""
                            }
                            
                            ${
                              isAdmin
                                ? `
                            <button class="btn btn-danger" onclick="confirmDeleteCar('${car.id}', '${safePlateNumber}', '${safeOwnerName}')">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                            `
                                : canEdit
                                  ? `
                            <button class="btn btn-danger" onclick="confirmDeleteCar('${car.id}', '${safePlateNumber}', '${safeOwnerName}')">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                            `
                                  : ""
                            }
                        </div>
                    </div>
                </div>
                `;
          })
          .join("");
      }

      // التحقق من وجود سيارات مسجلة من هذا الجهاز
      async function checkMyCars() {
        try {
          const { data, error } = await supabaseClient
            .from("cars")
            .select("id")
            .eq("device_id", deviceId)
            .eq("status", "active");

          const myCarsBtn = document.getElementById("myCarsBtn");
          if (myCarsBtn) {
            myCarsBtn.innerHTML = !error && data && data.length > 0
              ? `<i class="fas fa-car"></i> سياراتي المسجلة (${data.length})`
              : '<i class="fas fa-car"></i> سياراتي المسجلة';
          }
        } catch (error) {
          console.error("خطأ في التحقق من سياراتي:", error);
        }
      }

      // عرض سياراتي
      async function showMyCars() {
        const container = document.getElementById("myCarsContainer");

        // التحويل فورًا إلى صفحة "سياراتي" حتى تختفي جميع سيارات الآخرين
        showPage("myCarsPage");

        if (!container) return;

        container.innerHTML = `
          <div class="my-cars-loading" style="grid-column: 1/-1; text-align:center; padding:45px 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:var(--accent-blue);"></i>
            <h3 style="margin-top:15px; color:var(--text-primary);">جارٍ تحميل سياراتك...</h3>
          </div>
        `;

        try {
          if (!deviceId) {
            initializeDeviceId();
          }

          const { data, error } = await supabaseClient
            .from("cars")
            .select("*")
            .eq("device_id", deviceId)
            .eq("status", "active")
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (!data || data.length === 0) {
            container.innerHTML = `
              <div style="grid-column:1/-1; text-align:center; padding:45px 20px;">
                <i class="fas fa-car-side" style="font-size:3rem; color:#aaa; margin-bottom:15px;"></i>
                <h3 style="color:var(--text-primary);">لا توجد سيارات مسجلة من هذا الجهاز</h3>
                <p style="color:var(--text-secondary); margin-top:8px;">
                  السيارات التي تسجلها من هذا الجهاز ستظهر هنا فقط.
                </p>
                <button
                  type="button"
                  class="btn btn-success"
                  style="margin-top:18px;"
                  onclick="addNewCar()"
                >
                  <i class="fas fa-plus-circle"></i>
                  إضافة سيارتي
                </button>
              </div>
            `;
            return;
          }

          container.innerHTML = data.map((car) => {
            const safeOwnerName = String(car.owner_name || "").replace(/'/g, "\\'");
            const safePlateNumber = String(car.plate_number || "").replace(/'/g, "\\'");
            const safePhoneNumber = String(car.phone_number || "").replace(/'/g, "\\'");

            return `
              <div class="car-card">
                <div class="my-car-badge">
                  <i class="fas fa-check-circle"></i> سيارتي
                </div>

                <div class="car-header">
                  <h3>${car.car_model || ""}</h3>
                  <p>${car.plate_number || ""}</p>
                </div>

                <div class="car-body">
                  ${
                    car.car_image
                      ? `
                        <div style="text-align:center; margin-bottom:15px;">
                          <img
                            src="${car.car_image}"
                            style="max-width:100%; max-height:150px; border-radius:8px; border:1px solid var(--border-color);"
                            alt="صورة السيارة"
                            onerror="this.style.display='none'"
                          />
                        </div>
                      `
                      : ""
                  }

                  <div class="car-info">
                    <h3><i class="fas fa-user"></i> صاحب السيارة</h3>
                    <p>${car.owner_name || ""}</p>
                  </div>

                  <div class="car-info">
                    <h3><i class="fas fa-palette"></i> اللون</h3>
                    <p>${car.car_color || ""}</p>
                  </div>

                  <div class="car-info">
                    <h3><i class="fas fa-phone"></i> رقم الهاتف</h3>
                    <p>${car.phone_number || ""}</p>
                  </div>

                  <div class="car-info">
                    <h3><i class="fas fa-graduation-cap"></i> مجال التدريب</h3>
                    <p>${car.training_field || ""}</p>
                  </div>

                  <div class="car-actions">
                    <button
                      class="btn btn-primary contact-action-btn"
                      type="button"
                      onclick="contactOwner('${safePhoneNumber}', '${safeOwnerName}')"
                      title="اتصال هاتفي"
                    >
                      <i class="fas fa-phone-alt"></i> اتصل
                    </button>

                    <button
                      class="btn btn-whatsapp contact-action-btn"
                      type="button"
                      onclick="whatsappOwner('${safePhoneNumber}', '${safeOwnerName}', '${safePlateNumber}')"
                      title="مراسلة عبر واتساب"
                    >
                      <i class="fab fa-whatsapp"></i> واتساب
                    </button>

                    <button class="btn btn-warning" onclick="editCar('${car.id}')">
                      <i class="fas fa-edit"></i> تعديل
                    </button>

                    <button
                      class="btn btn-danger"
                      onclick="confirmDeleteCar('${car.id}', '${safePlateNumber}', '${safeOwnerName}')"
                    >
                      <i class="fas fa-trash"></i> حذف
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("");

        } catch (error) {
          console.error("خطأ في تحميل سياراتي:", error);

          container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:45px 20px;">
              <i class="fas fa-triangle-exclamation" style="font-size:2.6rem; color:#ffc107;"></i>
              <h3 style="margin-top:14px; color:var(--text-primary);">تعذر تحميل سياراتك</h3>
              <p style="color:var(--text-secondary); margin-top:8px;">
                تحقق من اتصال الإنترنت ثم حاول مرة أخرى.
              </p>
              <button type="button" class="btn btn-primary" style="margin-top:16px;" onclick="showMyCars()">
                <i class="fas fa-rotate"></i> إعادة المحاولة
              </button>
            </div>
          `;
        }
      }


      // التحقق من جلسة المدير عبر Supabase Auth
      async function initializeAdminAuth() {
        try {
          const { data, error } = await supabaseClient.auth.getSession();
          if (error) throw error;

          isAdmin = !!data.session;
          updateAdminDots();
          if (isAdmin) showResetDot();

          supabaseClient.auth.onAuthStateChange((event, session) => {
            isAdmin = !!session;
            updateAdminDots();
            if (isAdmin) showResetDot();
            else showResetDot();
          });
        } catch (error) {
          console.error("خطأ في التحقق من جلسة المدير:", error);
          isAdmin = false;
          updateAdminDots();
        }
      }

      // تسجيل دخول المدير عبر Supabase Auth
      async function adminLogin() {
        const email = document.getElementById("adminEmail").value.trim();
        const password = document.getElementById("adminPassword").value;

        if (!email || !password) {
          showAlert("adminLoginAlert","❌ أدخل البريد الإلكتروني وكلمة المرور","danger");
          return;
        }

        const submitBtn = document.querySelector("#adminLoginForm button[type='submit']");
        if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = "0.7"; }

        try {
          const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (!data.session) throw new Error("لم يتم إنشاء جلسة دخول");

          isAdmin = true;
          updateAdminDots();
          showResetDot();
          showAlert("adminLoginAlert","✅ تم تسجيل دخول المدير بنجاح","success");

          setTimeout(() => {
            closeModal("adminLoginModal");
            loadCars();
            showAlert("mainAlert","🔓 تم تفعيل وضع المدير","success");
          }, 700);
        } catch (error) {
          console.error("خطأ في تسجيل دخول المدير:", error);
          let message = "❌ البريد الإلكتروني أو كلمة المرور غير صحيحة";
          if (error?.message?.toLowerCase().includes("email not confirmed")) {
            message = "❌ يجب تأكيد البريد الإلكتروني أولًا من رسالة Supabase.";
          }
          showAlert("adminLoginAlert", message, "danger");
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = "1"; }
        }
      }

      // تسجيل خروج المدير عبر Supabase Auth
      async function adminLogout() {
        try {
          const { error } = await supabaseClient.auth.signOut();
          if (error) throw error;
        } catch (error) {
          console.error("خطأ في تسجيل خروج المدير:", error);
        } finally {
          isAdmin = false;
          updateAdminDots();
          showResetDot();
          loadCars();
          showAlert("mainAlert","🔒 تم تسجيل الخروج من وضع المدير","info");
        }
      }

      // إضافة سيارة جديدة
      function addNewCar() {
        document.getElementById("carModalTitle").textContent =
          "إضافة سيارة جديدة";
        document.getElementById("carForm").reset();
        document.getElementById("carId").value = "";
        removeImage(); // تنظيف الصورة
        showModal("carModal");
      }

      // تعديل سيارة
      async function editCar(carId) {
        try {
          const { data, error } = await supabaseClient
            .from("cars")
            .select("*")
            .eq("id", carId)
            .single();

          if (error) throw error;

          // التحقق من أن المستخدم هو مالك السيارة أو المدير
          if (data.device_id !== deviceId && !isAdmin) {
            showAlert(
              "mainAlert",
              "❌ ليس لديك صلاحية تعديل هذه السيارة",
              "danger",
            );
            return;
          }

          document.getElementById("carModalTitle").textContent =
            "تعديل بيانات السيارة";
          document.getElementById("carId").value = data.id;
          document.getElementById("ownerName").value = data.owner_name;
          document.getElementById("carModel").value = data.car_model;
          document.getElementById("plateNumber").value = data.plate_number;
          document.getElementById("carColor").value = data.car_color;
          document.getElementById("phoneNumber").value = data.phone_number;
          document.getElementById("trainingField").value = data.training_field;

          // تعبئة حقل الصورة
          if (data.car_image) {
            carImageData = data.car_image;
            displayImagePreview(data.car_image);
          } else {
            removeImage();
          }

          showModal("carModal");
        } catch (error) {
          console.error("خطأ في تحميل بيانات السيارة:", error);
          showAlert("mainAlert", "حدث خطأ في تحميل بيانات السيارة", "danger");
        }
      }

      // حفظ السيارة (النسخة المعدلة - تسمح بأرقام لوحة متكررة)
      async function saveCar() {
        const carId = document.getElementById("carId").value;
        const carData = {
          owner_name: document.getElementById("ownerName").value.trim(),
          car_model: document.getElementById("carModel").value.trim(),
          plate_number: document
            .getElementById("plateNumber")
            .value.trim()
            .toUpperCase(),
          car_color: document.getElementById("carColor").value,
          phone_number: document.getElementById("phoneNumber").value.trim(),
          training_field: document.getElementById("trainingField").value.trim(),
          device_id: deviceId,
          status: "active",
        };


        // -------------------------------------------------------
        // فحص التكرار قبل رفع الصورة.
        // قاعدة البيانات تبقى الحماية النهائية بواسطة UNIQUE INDEX.
        // -------------------------------------------------------
        if (!carId) {
          const { data: existingCars, error: duplicateCheckError } =
            await supabaseClient
              .from("cars")
              .select("id")
              .eq("status", "active")
              .ilike("owner_name", carData.owner_name)
              .ilike("car_model", carData.car_model)
              .eq("plate_number", carData.plate_number)
              .ilike("car_color", carData.car_color)
              .eq("phone_number", carData.phone_number)
              .ilike("training_field", carData.training_field)
              .limit(1);

          if (!duplicateCheckError && existingCars && existingCars.length > 0) {
            showAlert(
              "carFormAlert",
              `❌ <strong>هذه السيارة مسجلة مسبقًا</strong><br>
               لا يمكن إضافة نفس البيانات مرة أخرى.`,
              "warning"
            );
            return;
          }
        }

        // التحقق من البيانات المطلوبة
        if (
          !carData.owner_name ||
          !carData.plate_number ||
          !carData.phone_number
        ) {
          showAlert(
            "carFormAlert",
            "❌ الرجاء ملء جميع الحقول المطلوبة",
            "danger",
          );
          return;
        }

        try {
          // رفع الصورة إذا وجدت
          if (carImageData && carImageData.startsWith("data:image")) {
            console.log("📤 جاري رفع الصورة...");
            const imageUrl = await uploadImageToStorage(
              carImageData,
              carData.plate_number,
            );
            if (imageUrl) {
              carData.car_image = imageUrl;
              console.log("✅ تم رفع الصورة:", imageUrl);
            }
          } else if (carImageData && typeof carImageData === "string") {
            // إذا كانت الصورة بالفعل رابط
            carData.car_image = carImageData;
          }

          let result;

          if (carId) {
            console.log("✏️ جاري تحديث السيارة:", carId);
            // تعديل سيارة موجودة
            result = await supabaseClient
              .from("cars")
              .update(carData)
              .eq("id", carId);
          } else {
            console.log("➕ جاري إضافة سيارة جديدة");
            // إضافة سيارة جديدة
            result = await supabaseClient.from("cars").insert([carData]);
          }

          if (result.error) {
            console.error("❌ خطأ في حفظ السيارة:", result.error);

            // إزالة التحقق من رقم اللوحة المكرر
            if (
              result.error.code === "23505" ||
              String(result.error.message || "").includes("uq_cars_same_registration")
            ) {
              showAlert(
                "carFormAlert",
                `❌ <strong>هذه السيارة مسجلة مسبقًا</strong><br>
                 تم العثور على تسجيل مطابق لبيانات السيارة، لذلك لم تتم إضافة سجل جديد.`,
                "warning",
              );
              return;
            }

            if (result.error.message.includes("permission denied")) {
              showAlert(
                "carFormAlert",
                "❌ ليس لديك صلاحية للقيام بهذا الإجراء. تأكد من سياسات الأمان في قاعدة البيانات.",
                "danger",
              );
            } else {
              showAlert(
                "carFormAlert",
                `❌ تعذر حفظ البيانات حاليًا.<br>
                 يرجى المحاولة مرة أخرى.`,
                "danger",
              );
            }
            return;
          }

          showAlert(
            "carFormAlert",
            carId
              ? "✅ تم تحديث بيانات السيارة بنجاح"
              : "✅ تم إضافة السيارة بنجاح",
            "success",
          );

          setTimeout(() => {
            closeModal("carModal");
            loadCars();
            checkMyCars();

            if (currentPage === "myCarsPage") {
              showMyCars();
            }
          }, 1500);
        } catch (error) {
          console.error("❌ خطأ غير متوقع في حفظ السيارة:", error);
          showAlert(
            "carFormAlert",
            `❌ حدث خطأ غير متوقع: ${error.message}`,
            "danger",
          );
        }
      }

      // تأكيد حذف سيارة
      function confirmDeleteCar(carId, plateNumber, ownerName) {
        carToDelete = carId;
        document.getElementById("deleteCarInfo").textContent =
          `${ownerName} - ${plateNumber}`;
        showModal("confirmDeleteModal");
      }

      // حذف سيارة
      async function deleteCar(carId) {
        try {
          console.log("🗑️ جاري حذف السيارة:", carId);

          // أولاً، نتحقق مما إذا كانت السيارة موجودة
          const { data: existingCar, error: fetchError } = await supabaseClient
            .from("cars")
            .select("*")
            .eq("id", carId)
            .single();

          if (fetchError) {
            console.error("❌ خطأ في جلب بيانات السيارة:", fetchError);
            showAlert(
              "mainAlert",
              "❌ السيارة غير موجودة أو لا يمكن الوصول إليها",
              "danger",
            );
            return;
          }

          // التحقق من أن المستخدم هو المالك أو المدير
          if (existingCar.device_id !== deviceId && !isAdmin) {
            showAlert(
              "mainAlert",
              "❌ ليس لديك صلاحية حذف هذه السيارة",
              "danger",
            );
            return;
          }

          // تحديث الحالة إلى inactive بدلاً من الحذف الفعلي
          const { error } = await supabaseClient
            .from("cars")
            .update({
              status: "inactive",
              updated_at: new Date().toISOString(),
            })
            .eq("id", carId);

          if (error) {
            console.error("❌ خطأ في حذف السيارة:", error);

            if (error.message.includes("permission denied")) {
              showAlert(
                "mainAlert",
                "❌ ليس لديك صلاحية لحذف هذه السيارة. تأكد من سياسات الأمان في قاعدة البيانات.",
                "danger",
              );
            } else {
              showAlert(
                "mainAlert",
                `❌ حدث خطأ في حذف السيارة: ${error.message}`,
                "danger",
              );
            }
            return;
          }

          closeModal("confirmDeleteModal");
          showAlert("mainAlert", "✅ تم حذف السيارة بنجاح", "success");

          // تحديث القوائم
          setTimeout(() => {
            loadCars();
            checkMyCars();

            if (currentPage === "myCarsPage") {
              showMyCars();
            }
          }, 1000);
        } catch (error) {
          console.error("❌ خطأ غير متوقع في حذف السيارة:", error);
          showAlert(
            "mainAlert",
            `❌ حدث خطأ غير متوقع: ${error.message}`,
            "danger",
          );
        }
      }

      // إعادة قائمة السيارات إلى حالتها الأصلية بعد البحث
      async function refreshCarsList() {
        const refreshBtn = document.getElementById("refreshCarsBtn");
        const searchInput = document.getElementById("searchInput");
        const searchHint = document.getElementById("searchHint");

        if (refreshBtn) {
          refreshBtn.disabled = true;
          refreshBtn.classList.add("is-loading");
        }

        try {
          if (searchInput) searchInput.value = "";
          await loadCars();
          if (searchHint) {
            searchHint.textContent = "تم تحديث القائمة وإظهار جميع السيارات";
            searchHint.classList.add("show");
            setTimeout(() => searchHint.classList.remove("show"), 2500);
          }
        } catch (error) {
          console.error("خطأ في تحديث قائمة السيارات:", error);
        } finally {
          if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.classList.remove("is-loading");
          }
        }
      }

      // البحث عن السيارات
      async function performSearch() {
        const searchTerm = document.getElementById("searchInput").value.trim();

        if (!searchTerm) {
          await loadCars();
          return;
        }

        try {
          const { data, error } = await supabaseClient
            .from("cars")
            .select("*")
            .or(
              `plate_number.ilike.%${searchTerm}%,owner_name.ilike.%${searchTerm}%,car_model.ilike.%${searchTerm}%`,
            )
            .eq("status", "active");

          if (error) throw error;

          displayCars(data || []);
        } catch (error) {
          console.error("خطأ في البحث:", error);
        }
      }

      // =========================================================
      // التواصل مع صاحب السيارة: اتصال + واتساب
      // =========================================================

      function normalizeArabicPhoneDigits(value) {
        const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
        const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

        return String(value || "")
          .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
          .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)));
      }

      function normalizeSaudiPhone(phoneNumber) {
        let digits = normalizeArabicPhoneDigits(phoneNumber).replace(/\D/g, "");

        // 009665xxxxxxxx
        if (digits.startsWith("00966")) {
          digits = digits.slice(2);
        }

        // 05xxxxxxxx -> 9665xxxxxxxx
        if (digits.startsWith("05") && digits.length === 10) {
          return "966" + digits.slice(1);
        }

        // 5xxxxxxxx -> 9665xxxxxxxx
        if (digits.startsWith("5") && digits.length === 9) {
          return "966" + digits;
        }

        // 9665xxxxxxxx
        if (digits.startsWith("966")) {
          return digits;
        }

        // في حال كان الرقم بصيغة أخرى، نعيد الأرقام فقط.
        return digits;
      }

      function contactOwner(phoneNumber, ownerName) {
        const normalizedPhone = normalizeSaudiPhone(phoneNumber);

        if (!normalizedPhone) {
          alert("تعذر العثور على رقم هاتف صالح لهذا المسجل.");
          return;
        }

        const displayName = String(ownerName || "صاحب السيارة").trim();

        if (
          confirm(
            `هل تريد الاتصال بـ ${displayName}؟\nالرقم: +${normalizedPhone}`
          )
        ) {
          window.location.href = `tel:+${normalizedPhone}`;
        }
      }

      function whatsappOwner(phoneNumber, ownerName, plateNumber = "") {
        const normalizedPhone = normalizeSaudiPhone(phoneNumber);

        if (!normalizedPhone) {
          alert("تعذر فتح واتساب لأن رقم الهاتف غير صالح.");
          return;
        }

        const displayName = String(ownerName || "صاحب السيارة").trim();
        const plate = String(plateNumber || "").trim();

        const message = plate
          ? `السلام عليكم ${displayName}، أتواصل معك بخصوص سيارتك المسجلة في نظام مواقف سيارات الأكاديمية، رقم اللوحة: ${plate}.`
          : `السلام عليكم ${displayName}، أتواصل معك بخصوص سيارتك المسجلة في نظام مواقف سيارات الأكاديمية.`;

        const whatsappUrl =
          `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;

        // الانتقال المباشر أكثر اعتمادية على متصفحات الجوال،
        // ويفتح تطبيق واتساب عند توفره أو WhatsApp Web كبديل.
        window.location.href = whatsappUrl;
      }

      // وظائف المساعدة
      function showPage(pageId) {
        const target = document.getElementById(pageId);
        if (!target) return;

        document.querySelectorAll(".page").forEach((page) => {
          page.classList.remove("active");
          page.setAttribute("aria-hidden", "true");
        });

        target.classList.add("active");
        target.setAttribute("aria-hidden", "false");

        currentPage = pageId;

        // تنظيف البحث عند العودة للرئيسية
        if (pageId === "home") {
          const searchInput = document.getElementById("searchInput");
          if (searchInput) searchInput.value = "";
        }

        window.scrollTo({ top: 0, behavior: "smooth" });

        setTimeout(() => {
          document.dispatchEvent(new Event("nca-page-changed"));
        }, 350);
      }

      function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add("active");
        document.body.classList.add("modal-open");

        const scrollBtn = document.getElementById("scrollToBottomBtn");
        if (scrollBtn) {
          scrollBtn.classList.add("hidden");
        }
      }

      function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove("active");

        const anotherModalIsOpen = document.querySelector(".modal.active");

        if (!anotherModalIsOpen) {
          document.body.classList.remove("modal-open");
          window.dispatchEvent(new Event("scroll"));
        }

        // تنظيف الحقول في نموذج المدير
        if (modalId === "adminLoginModal") {
          document.getElementById("adminLoginForm").reset();
          document.getElementById("adminLoginAlert").style.display = "none";
        }

        // تنظيف الصورة في نموذج السيارة
        if (modalId === "carModal") {
          removeImage();
        }
      }

      function showAlert(elementId, message, type) {
        const alertElement = document.getElementById(elementId);
        alertElement.innerHTML = message;
        alertElement.className = `alert alert-${type}`;
        alertElement.style.display = "block";

        setTimeout(() => {
          alertElement.style.display = "none";
        }, 5000);
      }

      // إغلاق الموديل عند النقر خارجها
      window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
          closeModal(e.target.id);
        }
      });
