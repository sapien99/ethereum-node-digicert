<template>
  <installation-box :title="title" :back="back" :next="next">
    <div class="upload-parent space-y-2">
      <div class="content-box shadow-md shadow-gray-700">
        <div class="description">
          <p>
            {{ $t("uploadConfig.message") }}
          </p>
        </div>
        <div class="uploadBox">
          <div class="uploadBox__title">
            <span>{{ $t("uploadConfig.selectConfig") }}</span>
          </div>
          <div class="uploadBox__content">
            <div class="uploadBox__content__file">
              <label class="w-full block mb-2 text-xs text-left font-medium text-slate-100" for="file_input">
                <span class="ml-2">{{ $t("uploadConfig.configFile") }}</span>
                <div class="input cursor-pointer">
                  <input
                    id="file_input"
                    ref="fileInput"
                    class="hidden"
                    type="file"
                    accept=".zip"
                    @change="handleFileUpload"
                  />
                  <img src="/img/icon/PLUS_ICON.png" alt="icon" />
                  <span class="ml-2 text-xl text-gray-700 overflow-hidden"> {{ fileName }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div class="messageBox">
          <p v-if="message" class="h-5 text-sm text-red-400 font-semibold mt-0">{{ message }}</p>
        </div>
      </div>
    </div>
  </installation-box>
</template>

<script>
import { mapWritableState } from "pinia";
import { useClickInstall } from "@/store/clickInstallation";
import { useServices } from "@/store/services";
import YAML from "yaml";
// import ControlService from "@/store/ControlService";
import JSZip from "jszip";

export default {
  name: "UploadConfig",
  data() {
    return {
      back: "welcome",
      title: "CONFIG IMPORT",
      next: "disabled",
      fileName: "",
      isMessageActive: false,
      message: "",
      file: null,
      uploadConfirmed: false,
      zipFile: null,
      isValid: false,
      yamlData: null,
      yamlFiles: [],
    };
  },

  computed: {
    ...mapWritableState(useClickInstall, {
      unzippedData: "unzippedData",
      configServices: "configServices",
    }),
    ...mapWritableState(useServices, {
      allServices: "allServices",
    }),
  },
  mounted() {
    this.unzippedData = [];
    this.configServices = [];
    this.fileName = "";
  },
  methods: {
    async handleFileUpload(event) {
      // load config .zip file
      const file = event.target.files[0];
      if (file.type !== "application/zip" && file.type !== "application/x-zip-compressed") {
        this.isMessageActive = true;
        this.message = "Invalid file type. Please select a valid file.";
        return;
      }

      // extract, then check extensions of the files (.yaml)
      this.isMessageActive = false;
      this.fileName = file.name;
      const zip = await JSZip.loadAsync(file);
      const yamlFiles = zip.file(/\.yaml$/i).filter((file) => !file.name.includes("_MACOSX"));

      if (yamlFiles.length === 0) {
        this.isMessageActive = true;
        this.message = "Invalid file type. Please try again with a valid file.";
        return;
      }

      // check name of the config files
      let serviceName = [];
      for (const file of yamlFiles) {
        const data = await file.async("string");
        serviceName.push({
          name: YAML.parse(data).service,
        });
      }
      const filteredServices = this.allServices.filter((service) => {
        return serviceName.some((item) => item.name === service.service);
      });

      if (filteredServices.length === 0) {
        this.isMessageActive = true;
        this.message = "Invalid configuration file.";
        return;
      }

      let rootPath = "";
      for (const file of yamlFiles) {
        const data = await file.async("string");
        let serviceVolume = YAML.parse(data).volumes.find((el) => el.includes(YAML.parse(data).id));
        let split = {};

        if (serviceVolume) {
          let path = serviceVolume.split(YAML.parse(data).id)[0];
          split = path.split("/");
        }
        rootPath = serviceVolume
          ? split.slice(0, split.length - 1).join("/") + "/"
          : YAML.parse(data).service === "PrometheusNodeExporterService"
          ? "/"
          : rootPath;

        this.unzippedData.push({
          service: YAML.parse(data).service,
          id: YAML.parse(data).id,
          network: YAML.parse(data).network,
          content: data,
          path: rootPath,
        });
      }

      this.isMessageActive = false;
      this.message = "";
      this.next = "importingList";

      this.configServices = this.allServices
        .map((service) => {
          const sameItems = this.unzippedData.find((item) => {
            return item.service === service.service;
          });
          if (!sameItems) {
            return false;
          }
          return {
            ...sameItems,
            icon: service.icon,
            category: service.category,
            name: service.name,
          };
        })
        .filter((item) => item !== false);
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.upload-parent {
  grid-column: 2/5;
  grid-row: 3/4;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  position: relative;
  z-index: 2;
}

.content-box {
  width: 100%;
  height: 100%;
  background-color: #2d3134;
  border: 4px solid #dcdcdc;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;
  padding-bottom: 5px;
  border-radius: 20px;
}

.description {
  width: 100%;
  height: 30%;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.description p {
  font-size: 1rem;
  font-weight: 600;
  color: #d7d7d7;
  text-align: left;
}

.uploadBox {
  width: 100%;
  height: 57%;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}

.uploadBox__title {
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: start;
  align-items: center;
}

.uploadBox__title span {
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 10px;
  color: #d7d7d7;
  text-align: left;
}

.uploadBox__content {
  width: 100%;
  height: 60%;
  background-color: #191919;
  border: 3px solid gray;
  border-radius: 20px;
  padding: 5px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.uploadBox__content__file {
  width: 100%;
  height: 100%;
  border-radius: 15px;
  background-color: #336666;
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.uploadBox__content__file label {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: flex-start;
}

.uploadBox__content__file label .input {
  width: 100%;
  height: 50%;
  border-radius: 50px 10px 10px 50px;
  background-color: #cacaca;
  padding: 5px;
  padding-left: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.uploadBox__content__file label .input img {
  width: 28px;
  margin-left: 5px;
}

.messageBox {
  width: 100%;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
