import React, { useState, useEffect } from "react";
import { Box, Typography, Chip } from "@mui/material";
import PropTypes from "prop-types";
import TagSelector from "../../OrganizerCreateNewEvent/components/TagSelector";
import axiosInstance from "api/axiosInstance";


const TagSection = ({ isEditing, formData, setFormData, isReadOnly = false }) => {
  const [tags, setTags] = useState(formData.tags || []);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setTags(formData.tags || []);
  }, [formData.tags]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axiosInstance.get("/tags/suggest");
        setSuggestions(res.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách tag:", err);
      }
    };

    fetchTags();
  }, []);

  const handleCreateTag = (newTag) => {
    setSuggestions((prev) => (prev.includes(newTag) ? prev : [...prev, newTag]));
  };

  return (
   <Box mt={4}>
  {isEditing && (
    <>
      <Typography fontSize={16} fontWeight={600} mb={1}>
        Thẻ sự kiện:
      </Typography>

      <Box mb={2}>
        <TagSelector
          label="Chọn hoặc tạo thẻ"
          value={tags}
          onChange={(updatedTags) => {
            setTags(updatedTags);
            setFormData((prev) => ({ ...prev, tags: updatedTags }));

            // Nếu có tag mới thì thêm vào suggestion
            updatedTags.forEach((tag) => {
              if (!suggestions.includes(tag)) {
                handleCreateTag(tag);
              }
            });
          }}
          options={suggestions.map((tag) => ({ label: tag, value: tag }))}
          searchable
        />
      </Box>
    </>
  )}

  {formData.tags?.length > 0 && (
    <>
      {!isEditing && (
        <Typography fontSize={16} fontWeight={600} mb={1}>
          Thẻ sự kiện:
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 2,
        }}
      >
        {formData.tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            sx={{
              fontSize: 14,
              fontWeight: 500,
              backgroundColor: "#fff",
              border: 1,
              borderColor: "#5669FF",
              color: "#5669FF",
            }}
            onDelete={
              isEditing
                ? () => {
                    const updatedTags = formData.tags.filter((_, i) => i !== index);
                    setFormData((prev) => ({
                      ...prev,
                      tags: updatedTags,
                    }));
                    setTags(updatedTags);
                  }
                : undefined
            }
          />
        ))}
      </Box>
    </>
  )}
</Box>

  );
};

TagSection.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
};

export default TagSection;
