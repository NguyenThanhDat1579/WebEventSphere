import React from "react";
import { Grid, Typography, Button, Box } from "@mui/material";
import PropTypes from "prop-types";

const ImageSection = ({
  isEditing,
  formData,
  setFormData,
  setPreviewImageUrl,
  handleImageSelect,
  handleImageUpload,
  initialFormData,
}) => {
  return (
    <>
      {/* Ảnh đại diện */}
      <Grid item xs={12} md={6} mt={2}>
        <Typography fontSize={16} fontWeight={600} mb={1}>
          Ảnh đại diện:
        </Typography>
        <img
          src={
            isEditing && formData.avatarFile
              ? URL.createObjectURL(formData.avatarFile)
              : formData.avatar
          }
          alt="Avatar"
          style={{ width: 500, borderRadius: 8 }}
          onClick={() =>
            setPreviewImageUrl(
              isEditing && formData.avatarFile
                ? URL.createObjectURL(formData.avatarFile)
                : formData.avatar
            )
          }
        />
        {isEditing && (
          <>
            <Button
              variant="outlined"
              onClick={() => document.getElementById("avatar-upload").click()}
              sx={{
                mt: 1,
                ml: 5,
                backgroundColor: "#5669FF",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#5669FF",
                },
              }}
            >
              Tải ảnh đại diện mới
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImageSelect(e, "avatar")}
            />
          </>
        )}
      </Grid>

      {/* Ảnh banner */}
      <Grid item xs={12} md={6}>
        <Typography fontSize={16} fontWeight={600} mb={1}>
          Banner sự kiện:
        </Typography>
        <img
          src={
            isEditing && formData.bannerFile
              ? URL.createObjectURL(formData.bannerFile)
              : formData.banner
          }
          alt="Banner"
          style={{ width: 500, borderRadius: 8 }}
          onClick={() =>
            setPreviewImageUrl(
              isEditing && formData.bannerFile
                ? URL.createObjectURL(formData.bannerFile)
                : formData.banner
            )
          }
        />
        {isEditing && (
          <>
            <Button
              variant="outlined"
              onClick={() => document.getElementById("banner-upload").click()}
              sx={{
                mt: 1,
                ml: 5,
                backgroundColor: "#5669FF",
                color: "#fff",
                border: "1px solid rgb(233,236,239)",
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#5669FF",
                  borderColor: "#5669FF",
                },
              }}
            >
              Tải ảnh sự kiện mới
            </Button>
            <input
              type="file"
              hidden
              id="banner-upload"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, "banner")}
            />
          </>
        )}
      </Grid>

      {/* Ảnh liên quan */}
      {/* {(isEditing || initialFormData.images?.length > 0 || formData.images?.length > 0) && (
        <Grid item xs={12}>
          <Box mt={3}>
            <Typography fontSize={16} fontWeight={600} gutterBottom>
              Hình ảnh liên quan:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {(isEditing ? formData.images : initialFormData.images)?.map((img, index) => {
                const url = typeof img === "string" ? img : img.preview;

                return (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      width: 160,
                      height: 100,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid #ccc",
                    }}
                  >
                    <img
                      src={url}
                      alt={`image-${index}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onClick={() => setPreviewImageUrl(url)}
                    />
                    {isEditing && (
                      <Box
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }))
                        }
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </Box>
                    )}
                  </Box>
                );
              })}

              {isEditing && (
                <>
                  <Box
                    onClick={() => document.getElementById("gallery-upload").click()}
                    sx={{
                      width: 160,
                      height: 100,
                      borderRadius: 2,
                      border: "2px dashed #999",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#777",
                    }}
                  >
                    + Thêm ảnh
                  </Box>
                  <input
                    id="gallery-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageUpload}
                  />
                </>
              )}
            </Box>
          </Box>
        </Grid>
      )} */}
    </>
  );
};

ImageSection.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  setPreviewImageUrl: PropTypes.func.isRequired,
  handleImageSelect: PropTypes.func.isRequired,
  handleImageUpload: PropTypes.func.isRequired,
  initialFormData: PropTypes.object,
};

export default ImageSection;
