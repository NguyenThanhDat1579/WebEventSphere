import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

// Xử lý upload ảnh lên Cloudinary
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
  const scriptAppendedRef = useRef(false); // tránh gắn lại script nhiều lần

  useEffect(() => {
    if (!ready) return;

    const initTinyMCE = () => {
      if (!editorRef.current || !window.tinymce) return;

      window.tinymce.init({
        target: editorRef.current,
        height: 500,
        menubar: false,
        branding: false,
        placeholder: "Nhập nội dung...",
        license_key: "gpl",
        plugins: "image code advlist lists",
        toolbar:
          "undo redo | bold italic underline strikethrough | forecolor backcolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "customBullist customNumlist | fontsizeselect headingselect | image code",
        images_upload_handler: imageUploadHandler,

        setup: (editor) => {
          console.log("⚙️ [TinyMCE] setup() được gọi");
          tinymceEditor.current = editor;
          editor.on("Change KeyUp", () => {
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

          editor.ui.registry.addToggleButton("customBullist", {
            icon: "unordered-list",
            tooltip: "Bullet List",
            onAction: () => {
              editor.execCommand("InsertUnorderedList");
            },
            onSetup: (api) => {
              const toggleActive = () => {
                api.setActive(editor.queryCommandState("InsertUnorderedList"));
              };
              editor.on("NodeChange", toggleActive);
              return () => editor.off("NodeChange", toggleActive);
            },
          });

          editor.ui.registry.addToggleButton("customNumlist", {
            icon: "ordered-list",
            tooltip: "Numbered List",
            onAction: () => {
              editor.execCommand("InsertOrderedList");
            },
            onSetup: (api) => {
              const toggleActive = () => {
                api.setActive(editor.queryCommandState("InsertOrderedList"));
              };
              editor.on("NodeChange", toggleActive);
              return () => editor.off("NodeChange", toggleActive);
            },
          });
        },

        init_instance_callback: (editor) => {
          editor.setContent(value || "");
        },
      });
    };

    const loadScript = () => {
      if (window.tinymce) {
        initTinyMCE();
        return;
      }

      if (!scriptAppendedRef.current) {
        const script = document.createElement("script");
        script.src = "/tinymce/tinymce.min.js";
        script.referrerPolicy = "origin";
        script.onload = () => {
          console.log("✅ tinymce.min.js đã load");
          initTinyMCE();
        };
        script.onerror = () => {
          console.error("❌ Không thể load tinymce.min.js");
        };
        document.body.appendChild(script);
        scriptAppendedRef.current = true;
      }
    };

    loadScript();

    return () => {
      if (window.tinymce) {
        window.tinymce.remove();
      }
    };
  }, [ready]);

  return <textarea ref={editorRef} style={{ width: "100%" }} />;
};

TinyMCEEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  ready: PropTypes.bool.isRequired,
};

export default TinyMCEEditor;
