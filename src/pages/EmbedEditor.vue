<style lang="scss" scoped>
#embed_editor {
  height: 100%;
  padding: var(--gap-md);
}

*::-webkit-scrollbar {
  width: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  transition: all 50ms;
  border-radius: 20px;
  cursor: pointer;

  &:hover {
    background-color: var(--primary-muted-color);
  }
}

.embed-editor-wrapper {
  height: 100%;
  display: grid;
  grid-template-rows: 42px auto;
  gap: var(--gap-md);

  overflow: auto;

  .editor-header {
    top: 0;
    position: sticky;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    .header-editor,
    .header-preview {
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      padding: var(--gap-sm);

      h3 {
        margin: 0;
      }
    }

    button {
      display: block;
      padding: var(--gap-sm);
      background-color: var(--button-color);
      color: var(--text-color);
      border: none;
      font-size: 16px;
      border-radius: 5px;
      transition: all 150ms;
      cursor: pointer;

      &:hover {
        background-color: var(--primary-muted-color);
        color: var(--text-highlight-color);
      }
    }
  }

  .embed-editor-holder {
    height: 100%;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: var(--gap-md);
    overflow: auto;

    .embed-editable {
      display: flex;
      flex-flow: column nowrap;
      gap: var(--gap-sm);
      border-radius: var(--radius-md);
      padding: var(--gap-sm);
      margin-bottom: var(--gap-md);
      background-color: var(--highlighted-foreground-color);

      .embed-about {
        display: grid;
        grid-template-columns: 100fr auto auto auto;
        align-items: center;
        gap: var(--gap-sm);

        h4 {
          justify-self: left;
          margin: 0;
        }
      }

      .toggle-embed,
      .toggle-field,
      .embed-anchor {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: var(--gap-sm);

        cursor: pointer;
        user-select: none;
      }

      .embed-anchor {
        margin-top: var(--gap-sm);
        margin-bottom: 2px;
      }

      .field-anchor {
        display: grid;
        grid-template-columns: auto 30px;
        align-items: center;
      }

      .editable-author,
      .editable-images,
      .editable-fields,
      .editable-footer {
        display: grid;
        gap: var(--gap-sm);
        padding: var(--gap-sm);
        padding-top: 0;
        border-radius: var(--radius-sm);
        background-color: var(--background-color);
      }

      .editable-footer {
        grid-template-columns: 1fr 1fr;
        & > *:first-child {
          grid-column: span 2;
        }
      }
      .editable-author {
        grid-template-columns: 1fr 1fr;
        & > *:last-child {
          grid-column: span 2;
        }
      }

      .body-color {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;

        input[type="text"] {
          width: 120px;
          margin-top: var(--gap-sm);
          padding-top: 0;
          padding-bottom: 0;
        }
      }

      .footer-timestamp {
        input {
          display: inline-block;
          width: calc(100% - 30px - var(--gap-sm));
        }
        button {
          display: inline-block;
          max-width: 30px;
          margin-left: var(--gap-sm);
        }
      }

      .field-content {
        padding: var(--gap-sm);
      }
    }

    .editor-wrapper,
    .preview-wrapper {
      width: 100%;
      height: 100%;
      overflow: auto;

      background-color: var(--background-color);
      padding: var(--gap-sm);
      border-radius: var(--radius-md);
    }

    input[type="color"] {
      display: inline-block;
      border: none;
      padding: 0.7rem;
      width: 36px;
      height: 1rem;
      border-radius: var(--radius-sm);
      margin-left: var(--gap-sm);
    }

    input[type="text"],
    input[type="datetime-local"],
    textarea,
    button,
    input:-internal-autofill-selected {
      display: block;
      width: 100%;
      padding: var(--gap-sm);
      background-color: var(--button-color);
      color: var(--text-color);
      border: none;
      font-size: 16px;
      border-radius: 5px;
    }

    input[type="text"]:focus-visible,
    input[type="datetime-local"]:focus-visible,
    textarea:focus-visible,
    button:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px var(--primary-color);
    }

    textarea {
      max-width: 100% !important;
      min-width: 100% !important;
    }

    button {
      transition: all 150ms;
      cursor: pointer;

      &:hover {
        background-color: var(--primary-muted-color);
        color: var(--text-highlight-color);
      }
      &:disabled {
        background-color: var(--button-color) !important;
        filter: brightness(70%);
        cursor: not-allowed;
      }
    }
  }
  .json-editor {
    textarea {
      margin-top: var(--gap-md);
    }
  }
  .navigation {
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-sm);
  }
}
</style>

<template>
  <div id="embed_editor">
    <div class="embed-editor-wrapper">
      <div class="editor-header">
        <div class="header-editor">
          <button @click="handleCancel">Cancel</button>
          <h3 style="margin-right: var(--gap-lg)">Embed editor</h3>
        </div>
        <span class="header-separator">|</span>
        <div class="header-preview">
          <h3 style="margin-left: var(--gap-lg)">Embed preview</h3>
          <button @click="addEmbedsToMessage">Add to message</button>
        </div>
      </div>
      <div class="embed-editor-holder">
        <div class="editor-wrapper">
          <div class="content">
            <div
              class="embed-editable"
              v-for="(embed, index) in messageData.embeds"
              :style="`border-left: 5px solid #${embed.color || embed.color === 0 ? embed.color.toString(16) : ''}`"
            >
              <div class="embed-about">
                <div class="toggle-embed" @click="layout.embeds[index].show = !layout.embeds[index].show">
                  <ArrowIcon :style="layout.embeds[index].show ? '' : 'transform: rotate(-90deg)'" />
                  <h4>Embed {{ index + 1 }}</h4>
                </div>
                <button @click="removeEmbed(index)"><DeleteIcon /></button>
                <button @click="moveUp(index)" :disabled="index === 0">
                  <ArrowIcon style="transform: rotate(180deg)" />
                </button>
                <button @click="moveDown(index)" :disabled="index === messageData.embeds.length - 1">
                  <ArrowIcon />
                </button>
              </div>
              <div class="embed-content" v-show="layout.embeds[index].show">
                <div
                  class="author-anchor embed-anchor"
                  @click="layout.embeds[index].author = !layout.embeds[index].author"
                >
                  <ArrowIcon :style="layout.embeds[index].author ? '' : 'transform: rotate(-90deg)'" />
                  <span>Author</span>
                </div>
                <div class="editable-author" v-show="layout.embeds[index].author">
                  <div class="author-name">
                    <label :for="`author_name_${index}`">Author</label>
                    <input autocomplete="off" type="text" :id="`author_name_${index}`" v-model="embed.author.name" />
                  </div>
                  <div class="author-url">
                    <label :for="`author_url_${index}`">Author URL</label>
                    <input autocomplete="off" type="text" :id="`author_url_${index}`" v-model="embed.author.url" />
                  </div>
                  <div class="author-icon-url">
                    <label :for="`author_icon_url_${index}`">Author icon URL</label>
                    <input
                      autocomplete="off"
                      type="text"
                      :id="`author_icon_url_${index}`"
                      v-model="embed.author.icon_url"
                    />
                  </div>
                </div>
                <div class="body-anchor embed-anchor" @click="layout.embeds[index].data = !layout.embeds[index].data">
                  <ArrowIcon :style="layout.embeds[index].data ? '' : 'transform: rotate(-90deg)'" />
                  <span>Body</span>
                </div>
                <div class="editable-body" v-show="layout.embeds[index].data">
                  <div class="body-title">
                    <label :for="`title_${index}`">Title</label>
                    <input autocomplete="off" type="text" :id="`title_${index}`" v-model="embed.title" />
                  </div>
                  <div class="body-description">
                    <label :for="`description_${index}`">Description</label>
                    <textarea
                      autocomplete="off"
                      type="text"
                      :id="`description_${index}`"
                      v-model="embed.description"
                    ></textarea>
                  </div>
                  <div class="body-design">
                    <div class="body-url">
                      <label :for="`url_${index}`">URL</label>
                      <input autocomplete="off" type="text" :id="`url_${index}`" v-model="embed.url" />
                    </div>
                    <div class="body-color">
                      <label :for="`color_${index}`">Color</label>
                      <input
                        autocomplete="off"
                        type="color"
                        :style="`background-color: #${
                          embed.color || embed.color === 0 ? embed.color.toString(16) : ''
                        }`"
                        :id="`color_${index}`"
                        :value="embed.color"
                        @input="updateColor(index, $event.target.value)"
                      />
                      <input
                        autocomplete="off"
                        type="text"
                        :id="`color_flat_${index}`"
                        :value="embed.color.toString(16)"
                        @input="updateTextColor(index, $event.target.value)"
                      />
                    </div>
                  </div>
                </div>
                <div
                  class="image-anchor embed-anchor"
                  @click="layout.embeds[index].images = !layout.embeds[index].images"
                >
                  <ArrowIcon :style="layout.embeds[index].images ? '' : 'transform: rotate(-90deg)'" />
                  <span>Images</span>
                </div>
                <div class="editable-images" v-show="layout.embeds[index].images">
                  <div class="images-image">
                    <label :for="`image_${index}`">Image URL</label>
                    <input autocomplete="off" type="text" :id="`image_${index}`" v-model="embed.image.url" />
                  </div>
                  <div class="images-thumbnail">
                    <label :for="`thumbnail_${index}`">Thumnail image URL</label>
                    <input autocomplete="off" type="text" :id="`thumbnail_${index}`" v-model="embed.thumbnail.url" />
                  </div>
                </div>
                <div
                  class="footer-anchor embed-anchor"
                  @click="layout.embeds[index].footer = !layout.embeds[index].footer"
                >
                  <ArrowIcon :style="layout.embeds[index].footer ? '' : 'transform: rotate(-90deg)'" />
                  <span>Footer</span>
                </div>
                <div class="editable-footer" v-show="layout.embeds[index].footer">
                  <div class="footer-text">
                    <label :for="`footer_text_${index}`">Footer text</label>
                    <input autocomplete="off" type="text" :id="`footer_text_${index}`" v-model="embed.footer.text" />
                  </div>
                  <div class="footer-icon-url">
                    <label :for="`footer_icon_url_${index}`">Footer icon URL</label>
                    <input
                      autocomplete="off"
                      type="text"
                      :id="`footer_icon_url_${index}`"
                      v-model="embed.footer.icon_url"
                    />
                  </div>
                  <div class="footer-timestamp">
                    <label :for="`footer_timestamp_${index}`">Timestamp</label>
                    <input
                      autocomplete="off"
                      type="datetime-local"
                      :id="`footer_timestamp_${index}`"
                      @change="updateDate(index, $event.target.value)"
                    />
                    <button @click="embed.timestamp = ''">
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
                <div
                  class="fields-anchor embed-anchor"
                  @click="layout.embeds[index].fields = !layout.embeds[index].fields"
                >
                  <ArrowIcon :style="layout.embeds[index].fields ? '' : 'transform: rotate(-90deg)'" />
                  <span>Fields</span>
                </div>
                <div class="editable-fields" v-show="layout.embeds[index].fields">
                  <div class="editable-field" v-for="(field, f_index) in embed.fields">
                    <div
                      class="embed-anchor field-anchor"
                      @click="layout.embeds[index].field[f_index] = !layout.embeds[index].field[f_index]"
                    >
                      <span class="toggle-field"
                        ><ArrowIcon
                          :style="layout.embeds[index].field[f_index] ? '' : 'transform: rotate(-90deg)'"
                        />Field {{ f_index + 1 }}</span
                      >
                      <button @click="removeField(index, f_index)">
                        <DeleteIcon />
                      </button>
                    </div>
                    <div class="field-content" v-show="layout.embeds[index].field[f_index]">
                      <label :for="`field_name_${index}_${f_index}`">Field name</label>
                      <input
                        autocomplete="off"
                        type="text"
                        :id="`field_name_${index}_${f_index}`"
                        v-model="field.name"
                      />
                      <label :for="`field_value_${index}_${f_index}`">Field value</label>
                      <textarea
                        autocomplete="off"
                        :id="`field_value_${index}_${f_index}`"
                        v-model="field.value"
                      ></textarea>
                    </div>
                  </div>
                  <button @click="addNewField(index)">Add Field</button>
                </div>
              </div>
            </div>
          </div>
          <div class="navigation">
            <button @click="addNewEmbed">Add Embed</button>
            <button>Add Component</button>
            <button @click="layout.showJsonEditor = !layout.showJsonEditor">Json Editor</button>
          </div>
          <div class="json-editor" v-if="layout.showJsonEditor">
            <textarea style="min-height: 300px" @input="updateJsonData">{{ jsonData }}</textarea>
          </div>
        </div>
        <div class="preview-wrapper">
          <Message v-if="this.messageData.id" :message="messageData" :ignoreContextMenu="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DeleteIcon from "../components/icons/DeleteIcon.vue";
import ArrowIcon from "../components/icons/ArrowIcon.vue";
import Message from "../components/message/Message.vue";
import { useAppStore } from "../stores/app.js";
export default {
  components: { Message, DeleteIcon, ArrowIcon },
  data() {
    return {
      apx: useAppStore(),
      layout: {
        showJsonEditor: false,
        embeds: [],
        boforeOpen: {
          members: false,
          channels: false,
        },
      },
      messageData: {
        id: 1,
        author: useAppStore().user,
        content: useAppStore().data.textInput.message.content,
        timestamp: new Date().toISOString(),
        embeds: useAppStore().data.textInput.message.embeds || [],
      },
    };
  },
  beforeMount() {
    this.updateJsonData(null);
    if (this.apx.data.textInput.message.embeds) {
      this.apx.data.textInput.message.embeds.forEach((embed) => {
        this.layout.embeds.push({
          show: false,
          author: false,
          data: true,
          images: false,
          footer: false,
          fields: false,
          field: [],
          timestamp: "",
        });
      });
    }
  },
  mounted() {
    this.layout.boforeOpen.members = this.apx.layout.showMembers;
    this.apx.layout.showMembers = false;
    this.layout.boforeOpen.channels = this.apx.layout.showChannels;
    this.apx.layout.showChannels = false;
  },
  beforeUnmount() {
    this.apx.layout.showMembers = this.layout.boforeOpen.members;
    this.apx.layout.showChannels = this.layout.boforeOpen.members;
  },
  methods: {
    addEmbedsToMessage() {
      this.apx.data.textInput.message.embeds = this.messageData.embeds;
      this.$router.push(`/server/${this.apx.data.currentServerId}/${this.apx.data.currentChannelId}`);
    },
    handleCancel() {
      this.$router.push(`/server/${this.apx.data.currentServerId}/${this.apx.data.currentChannelId}`);
    },
    addNewEmbed() {
      this.messageData.embeds.push({
        author: {
          name: "",
          url: "",
          icon_url: "",
        },
        title: "",
        description: "",
        color: 1621212,
        url: "",
        image: { url: "" },
        thumbnail: { url: "" },
        footer: {
          text: "",
          icon_url: "",
        },
        fields: [],
        timestamp: "",
      });
      this.layout.embeds.push({
        show: true,
        author: false,
        data: true,
        images: false,
        footer: false,
        fields: false,
        field: [],
      });
    },
    addNewField(index) {
      this.messageData.embeds[index].fields.push({
        name: "",
        value: "",
      });
      this.layout.embeds[index].field.push(true);
    },
    removeField(index, f_index) {
      this.messageData.embeds[index].fields.splice(f_index, 1);
      this.layout.embeds[index].field.splice(f_index, 1);
    },
    removeEmbed(index) {
      this.messageData.embeds.splice(index, 1);
      this.layout.embeds.splice(f_index, 1);
    },
    moveUp(index) {
      if (index > 0) {
        const embed = this.messageData.embeds[index];
        this.messageData.embeds.splice(index, 1);
        this.messageData.embeds.splice(index - 1, 0, embed);
      }
    },
    moveDown(index) {
      if (index < this.messageData.embeds.length - 1) {
        const embed = this.messageData.embeds[index];
        this.messageData.embeds.splice(index, 1);
        this.messageData.embeds.splice(index + 1, 0, embed);
      }
    },
    updateColor(index, hexColor) {
      const decimalColor = this.hexToDecimal(hexColor);
      this.messageData.embeds[index].color = decimalColor;
    },
    updateTextColor(index, hexColor) {
      if (hexColor.length >= 4) {
        const decimalColor = this.hexToDecimal(hexColor);
        this.messageData.embeds[index].color = decimalColor;
      }
    },
    updateDate(index, value) {
      const date = new Date(value);
      this.messageData.embeds[index].timestamp = date.toISOString();
    },
    hexToDecimal(hex) {
      if (typeof hex === "string" && hex.startsWith("#")) {
        return Number.parseInt(hex.substring(1), 16);
      }
      if (typeof hex === "string") {
        return Number.parseInt(hex, 16);
      }
      return 0;
    },
    updateJsonData(event) {
      let object = null;
      if (event) {
        object = JSON.parse(event.target.value);
      } else {
        object = this.apx.data.textInput.message.embeds;
      }
      if (object == null) return;
      console.debug(object);
      try {
        // Define default values for an embed object
        const defaultEmbed = {
          author: {
            name: "",
            url: "",
            icon_url: "",
          },
          title: "",
          description: "",
          color: 1621212,
          url: "",
          image: { url: "" },
          thumbnail: { url: "" },
          footer: {
            text: "",
            icon_url: "",
          },
          fields: [],
        };

        // Define default values for a field
        const defaultField = {
          name: "",
          value: "",
          inline: false,
        };

        // Iterate over each embed object and ensure all properties are present
        this.messageData.embeds = object.map((embed) => ({
          ...defaultEmbed,
          ...embed,
          fields: embed.fields
            ? embed.fields.map((field) => ({
                ...defaultField,
                ...field,
              }))
            : [], // Provide a default empty array if fields is undefined
        }));
        this.layout.embeds = [];
        object.forEach((embed) => {
          this.layout.embeds.push({
            show: true,
            author: false,
            data: true,
            images: false,
            footer: false,
            fields: false,
            field: [],
          });
        });

        console.debug(this.messageData);
      } catch (err) {
        console.error(err, object, event);
      }
    },
  },
  computed: {
    jsonData() {
      return JSON.stringify(this.messageData.embeds);
    },
  },
};
</script>
