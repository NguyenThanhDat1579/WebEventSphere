import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const imageUploadHandler = (blobInfo) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/deoqppiun/image/upload");

    xhr.onload = () => {
      if (xhr.status !== 200) return reject("Upload lỗi: " + xhr.statusText);
      const response = JSON.parse(xhr.responseText);
      response.secure_url ? resolve(response.secure_url) : reject("Không có secure_url");
    };

    xhr.onerror = () => reject("Lỗi mạng khi upload");

    const formData = new FormData();
    formData.append("file", blobInfo.blob(), blobInfo.filename());
    formData.append("upload_preset", "event_upload");

    xhr.send(formData);
  });
};

const TinyMCEEditor = ({ value = "", onChange, ready }) => {
  const editorRef = useRef(null);
  const tinymceEditor = useRef(null);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const initTinyMCE = () => {
      if (!editorRef.current) return;

      window.tinymce.init({
        target: editorRef.current,
        height: 500,
        menubar: false,
        branding: false,
        placeholder: "Nhập nội dung...",
        plugins: "image textcolor code align",
        toolbar:
          "undo redo | bold italic underline strikethrough | forecolor backcolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "fontsizeselect headingselect | image code",
        images_upload_handler: imageUploadHandler,

        setup: (editor) => {
          console.log("⚙️ [TinyMCE] setup() được gọi");
          tinymceEditor.current = editor;
          editor.on("Change KeyUp", () => {
            console.log("✏️ [TinyMCE] Nội dung thay đổi:", editor.getContent());
            onChange(editor.getContent());
          });

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
              callback(
                headings.map((h) => ({
                  type: "menuitem",
                  text: h.text,
                  onAction: () => editor.execCommand("FormatBlock", false, h.format),
                }))
              );
            },
          });

          editor.ui.registry.addMenuButton("fontsizeselect", {
            text: "Cỡ chữ",
            fetch: (callback) => {
              const sizes = ["8px", "10px", "12px", "14px", "16px", "18px", "24px", "32px", "48px"];
              callback(
                sizes.map((size) => ({
                  type: "menuitem",
                  text: size,
                  onAction: () => {
                    editor.formatter.register("customsize", {
                      inline: "span",
                      styles: { fontSize: size },
                    });
                    editor.formatter.apply("customsize");
                  },
                }))
              );
            },
          });
        },

        init_instance_callback: (editor) => {
          editor.setContent(value || "");
        },
      });
    };

    if (!window.tinymce) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.tiny.cloud/1/36nqqbctvop7f7408urdehcqzy0qg1hssepzhmb5w12yo3pd/tinymce/6/tinymce.min.js";
      script.referrerPolicy = "origin";
      script.onload = initTinyMCE;
      document.body.appendChild(script);
    } else {
      initTinyMCE();
    }

    return () => {
      if (window.tinymce) {
        window.tinymce.remove();
      }
    };
  }, [ready]); // ✅ theo dõi ready để init đúng lúc

  return <textarea ref={editorRef} />;
};

TinyMCEEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  ready: PropTypes.bool.isRequired,
};

export default TinyMCEEditor;
