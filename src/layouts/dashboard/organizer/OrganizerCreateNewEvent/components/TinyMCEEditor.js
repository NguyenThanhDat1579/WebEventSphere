import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

// ✅ Hàm upload ảnh kèm console log
const imageUploadHandler = (blobInfo) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/deoqppiun/image/upload");

    xhr.onload = () => {
      console.log("📥 Đã nhận phản hồi từ Cloudinary");
      if (xhr.status !== 200) {
        console.error("❌ Upload thất bại: " + xhr.statusText);
        reject("Upload lỗi: " + xhr.statusText);
        return;
      }

      const response = JSON.parse(xhr.responseText);
      console.log("✅ Phản hồi Cloudinary:", response);

      if (response.secure_url) {
        console.log("📸 Ảnh đã upload thành công:", response.secure_url);
        resolve(response.secure_url);
      } else {
        console.error("❌ Không tìm thấy secure_url trong phản hồi.");
        reject("Không tìm thấy secure_url");
      }
    };

    xhr.onerror = () => {
      console.error("❌ Lỗi mạng khi upload ảnh.");
      reject("Lỗi mạng khi upload");
    };

    const formData = new FormData();
    formData.append("file", blobInfo.blob(), blobInfo.filename());
    formData.append("upload_preset", "event_upload");

    xhr.send(formData);
  });
};

const TinyMCEEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!window.tinymce || !editorRef.current) {
      return;
    }

    window.tinymce.init({
      target: editorRef.current,
      height: 500,
      menubar: false,
      plugins: "image textcolor code align",
      toolbar:
        "undo redo | bold italic underline strikethrough | forecolor backcolor | " +
        "alignleft aligncenter alignright alignjustify | " +
        "fontsizeselect headingselect | image code",
      branding: false,
      placeholder: "Nhập nội dung...",

      images_upload_handler: imageUploadHandler,

      setup: (editor) => {
        editor.on("Change KeyUp", () => {
          onChange(editor.getContent());
        });
        editor.on("init", () => {
          editor.setContent(value || "");
        });

        // (Optional) Dropdown headingselect — nếu bạn muốn giữ lại
        editor.ui.registry.addMenuButton("headingselect", {
          text: "Font Heading",
          fetch: (callback) => {
            const headings = [
              { text: "Heading 1", format: "h1" },
              { text: "Heading 2", format: "h2" },
              { text: "Heading 3", format: "h3" },
              { text: "Heading 4", format: "h4" },
              { text: "Heading 5", format: "h5" },
              { text: "Heading 6", format: "h6" },
              { text: "Paragraph", format: "p" },
            ];
            const items = headings.map((h) => ({
              type: "menuitem",
              text: h.text,
              onAction: () => editor.execCommand("FormatBlock", false, h.format),
            }));
            callback(items);
          },
        });

        editor.ui.registry.addMenuButton("fontsizeselect", {
          text: "Cỡ chữ",
          fetch: (callback) => {
            const sizes = ["8px", "10px", "12px", "14px", "16px", "18px", "24px", "32px", "48px"];
            const items = sizes.map((size) => ({
              type: "menuitem",
              text: size,
              onAction: () => {
                editor.formatter.register("customsize", {
                  inline: "span",
                  styles: { fontSize: size },
                });
                editor.formatter.apply("customsize");
              },
            }));
            callback(items);
          },
        });
      },
    });

    return () => {
      if (window.tinymce) {
        window.tinymce.remove(editorRef.current);
      }
    };
  }, [onChange, value]);

  return <textarea ref={editorRef} />;
};

TinyMCEEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TinyMCEEditor;
