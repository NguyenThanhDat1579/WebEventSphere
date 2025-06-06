import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const TinyMCEEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!window.tinymce) {
      console.error("TinyMCE script chưa được load!");
      return;
    }

    if (!editorRef.current) return;

    window.tinymce.init({
      target: editorRef.current,
      menubar: false,
      branding: false, // Tắt logo TinyMCE
      height: 600,
      placeholder: "Nhập nội dung mô tả sự kiện tại đây...",
      plugins: [
        "advlist autolink lists link image charmap print preview anchor",
        "searchreplace visualblocks code fullscreen",
        "insertdatetime media table paste code help wordcount",
      ],
      toolbar:
        "undo redo | fontselect fontsizeselect | bold italic underline strikethrough | " +
        "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
        "bullist numlist outdent indent | image | removeformat | help",

      fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
      font_formats:
        "Arial=arial,helvetica,sans-serif;" +
        "Courier New=courier new,courier,monospace;" +
        "Georgia=georgia,palatino;" +
        "Tahoma=tahoma,arial,helvetica,sans-serif;" +
        "Times New Roman=times new roman,times;" +
        "Verdana=verdana,geneva;",

      images_upload_url: "/upload-image", // tùy chỉnh nếu có backend
      automatic_uploads: true,
      file_picker_types: "image",

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
