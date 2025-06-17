import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const TinyMCEEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!window.tinymce) {
      console.error("TinyMCE chưa được load! Vui lòng kiểm tra script CDN.");
      return;
    }

    if (!editorRef.current) return;

    window.tinymce.init({
      target: editorRef.current,
      height: 500,
      menubar: false,
      branding: false,
      placeholder: "Nhập mô tả sự kiện tại đây...",
      plugins: [
        "advlist autolink lists link image charmap preview anchor",
        "searchreplace visualblocks code fullscreen",
        "insertdatetime media table paste help wordcount",
        "fontselect fontsizeselect formatselect", // ✅ cần plugin để hiển thị nút
      ],
      toolbar:
        "undo redo | formatselect fontselect fontsizeselect | " +
        "bold italic underline strikethrough forecolor backcolor | " +
        "alignleft aligncenter alignright alignjustify | " +
        "bullist numlist outdent indent | link image | removeformat | preview",

      font_formats:
        "Arial=arial,helvetica,sans-serif;" +
        "Courier New=courier new,courier,monospace;" +
        "Georgia=georgia,palatino;" +
        "Tahoma=tahoma,arial,helvetica,sans-serif;" +
        "Times New Roman=times new roman,times;" +
        "Verdana=verdana,geneva;",

      fontsize_formats: "12px 14px 16px 18px 24px 36px",

      automatic_uploads: true,
      file_picker_types: "image",

      // ✅ Upload trực tiếp lên Cloudinary
      images_upload_handler: async (blobInfo, success, failure) => {
        try {
          const formData = new FormData();
          formData.append("file", blobInfo.blob());
          formData.append("upload_preset", "event_upload"); // Preset phải là unsigned

          const response = await fetch("https://api.cloudinary.com/v1_1/deoqppiun/image/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload lỗi: ${response.statusText}`);
          }

          const data = await response.json();
          if (data.secure_url) {
            success(data.secure_url); // URL ảnh chèn vào HTML
          } else {
            failure("Không nhận được secure_url từ Cloudinary");
          }
        } catch (err) {
          console.error("❌ Upload thất bại:", err);
          failure("Upload thất bại: " + err.message);
        }
      },

      setup: (editor) => {
        editor.on("Change KeyUp", () => {
          onChange(editor.getContent());
        });
        editor.on("init", () => {
          editor.setContent(value || "");
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
