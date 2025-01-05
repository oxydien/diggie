<style lang="scss" scoped>
/* Jump to line #:230 */
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
      align-items: center;
      padding: var(--gap-sm);

      h3 {
        margin: 0;
        height: fit-content;
      }
    }

    button {
      width: 150px;
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
      padding: var(--gap-md);
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
        padding-top: var(--gap-md);
        margin-bottom: 2px;
      }

      .field-anchor {
        display: grid;
        grid-template-columns: auto 40px;
        align-items: center;
      }

      .editable-author,
      .editable-images,
      .editable-fields,
      .editable-footer {
        display: grid;
        gap: var(--gap-sm);
        padding: var(--gap-md);
        border-radius: var(--radius-sm);
        background-color: var(--alternate-foreground-color);
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
        margin-top: var(--gap-sm);

        input[type="text"] {
          width: 120px;
          margin-left: var(--gap-sm);
        }
      }

      .footer-timestamp {
        display: grid;
        grid-template-columns: auto 40px;
        gap: var(--gap-sm);

        label {
          grid-column: 1 / span 2;
        }
        input {
          display: inline-block;
          padding-top: var(--gap-md);
          width: 100%;
        }
        button {
          display: inline-block;
          max-width: 40px;
          margin-left: var(--gap-sm);
        }
      }

      .footer-icon-url {
        display: flex;
        flex-flow: column nowrap;
        gap: var(--gap-sm);

        input {
          height: 100%;
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
      padding: var(--gap-md);

      background-color: var(--background-color);
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
      background-color: var(--button-color);
      border-radius: 5px;
    }

    textarea {
      max-width: 100% !important;
      min-width: 100% !important;
      min-height: 3em;
      resize: vertical !important;
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
          <Button @click="handleCancel">Cancel</Button>
          <h3 style="margin-right: var(--gap-lg)">Embed editor</h3>
        </div>
        <span class="header-separator">|</span>
        <div class="header-preview">
          <h3 style="margin-left: var(--gap-lg)">Embed preview</h3>
          <Button color="primary" @click="addEmbedsToMessage">Add to message</Button>
        </div>
      </div>
      <div class="embed-editor-holder">
        <div class="editor-wrapper">
          <div class="content">
            <!-- MARK: Embeds -->
            <div
              class="embed-editable"
              v-for="(embed, index) in messageData.embeds"
              :style="`border-left: 5px solid #${
                embed.color || embed.color === 0 ? embed.color.toString(16) : ''
              }`"
            >
              <!-- MARK: Embed about -->
              <div class="embed-about">
                <div
                  class="toggle-embed"
                  @click="
                    layout.embeds[index].show = !layout.embeds[index].show
                  "
                >
                  <ArrowIcon
                    :style="
                      layout.embeds[index].show
                        ? ''
                        : 'transform: rotate(-90deg)'
                    "
                  />
                  <h4>Embed {{ index + 1 }}</h4>
                </div>

                <!-- MARK: Embed actions -->
                <Button @click="removeEmbed(index)"><DeleteIcon /></Button>
                <Button @click="moveUp(index)" :disabled="index === 0">
                  <ArrowIcon style="transform: rotate(180deg)" />
                </Button>
                <Button
                  @click="moveDown(index)"
                  :disabled="index === messageData.embeds.length - 1"
                >
                  <ArrowIcon />
                </Button>
              </div>
              <!-- MARK: Embed content -->
              <div class="embed-content" v-show="layout.embeds[index].show">
                <!-- MARK: Embed author -->
                <div
                  class="author-anchor embed-anchor"
                  @click="
                    layout.embeds[index].author = !layout.embeds[index].author
                  "
                >
                  <ArrowIcon
                    :style="
                      layout.embeds[index].author
                        ? ''
                        : 'transform: rotate(-90deg)'
                    "
                  />
                  <span>Author</span>
                </div>
                <div
                  class="editable-author"
                  v-show="layout.embeds[index].author"
                >
                  <div class="author-name">
                    <label :for="`author_name_${index}`">Author</label>
                    <Input
                      autocomplete="off"
                      type="text"
                      :id="`author_name_${index}`"
                      v-model="embed.author.name"
                    />
                  </div>
                  <div class="author-url">
                    <label :for="`author_url_${index}`">Author URL</label>
                    <Input
                      autocomplete="off"
                      type="text"
                      :id="`author_url_${index}`"
                      v-model="embed.author.url"
                    />
                  </div>
                  <div class="author-icon-url">
                    <label :for="`author_icon_url_${index}`"
                      >Author icon URL</label
                    >
                    <Input
                      autocomplete="off"
                      type="text"
                      :id="`author_icon_url_${index}`"
                      v-model="embed.author.icon_url"
                    />
                  </div>
                </div>

                <!-- MARK: Embed body -->
                <div
                  class="body-anchor embed-anchor"
                  @click="
                    layout.embeds[index].data = !layout.embeds[index].data
                  "
                >
                  <ArrowIcon
                    :style="
                      layout.embeds[index].data
                        ? ''
                        : 'transform: rotate(-90deg)'
                    "
                  />
                  <span>Body</span>
                </div>
                <div class="editable-body" v-show="layout.embeds[index].data">
                  <!-- MARK: Embed title -->
                  <div class="body-title">
                    <label :for="`title_${index}`">Title</label>
                    <Input
                      autocomplete="off"
                      type="text"
                      :id="`title_${index}`"
                      v-model="embed.title"
                    />
                  </div>
                  <!-- MARK: Embed description -->
                  <div class="body-description">
                    <label :for="`description_${index}`">Description</label>
                    <Textarea
                      autocomplete="off"
                      type="text"
                      :id="`description_${index}`"
                      v-model="embed.description"
                    ></Textarea>
                  </div>
                  <div class="body-design">
                    <!-- MARK: Embed url -->
                    <div class="body-url">
                      <label :for="`url_${index}`">URL</label>
                      <Input
                        autocomplete="off"
                        type="text"
                        :id="`url_${index}`"
                        v-model="embed.url"
                      />
                    </div>
                    <!-- MARK: Embed color -->
                    <div class="body-color">
                      <label :for="`color_${index}`">Color</label>
                      <Input
                        autocomplete="off"
                        type="color"
                        :style="`background-color: #${
                          embed.color || embed.color === 0
                            ? embed.color.toString(16)
                            : ''
                        }`"
                        :id="`color_${index}`"
                        :value="embed.color"
                        @input="updateColor(index, $event.target.value)"
                      />
                      <Input
                        autocomplete="off"
                        type="text"
                        :id="`color_flat_${index}`"
                        :value="embed.color.toString(16)"
                        @input="updateTextColor(index, $event.target.value)"
                      />
                    </div>
                  </div>
                </div>

                <!-- MARK: Embed images -->
                <div
                  class="image-anchor embed-anchor"
                  @click="
                    layout.embeds[index].images = !layout.embeds[index].images
                  "
                >
                  <ArrowIcon
                    :style="
                      layout.embeds[index].images
                        ? ''
                        : 'transform: rotate(-90deg)'
                    "
                  />
                  <span>Images</span>
                </div>
                <div
                  class="editable-images"
                  v-show="layout.embeds[index].images"
                >
                  <!-- MARK: Embed banner -->
                  <div class="images-image">
                    <label :for="`image_${index}`">Image URL</label>
                    <Input
                      autocomplete="off"
                      type="text"
                      :id="`image_${index}`"
                      v-model="embed.image.url"
                    />
                  </div>

                  <!-- MARK: Embed thumbnail -->
                  <div class="images-thumbnail">
                    <label :for="`thumbnail_${index}`"
                      >Thumnail image URL</label
                    >
                    <Input
                      autocomplete="off"
                      type="text"
                      :id="`thumbnail_${index}`"
                      v-model="embed.thumbnail.url"
                    />
                  </div>
                </div>

                <!-- MARK: Embed footer -->
                <div
                  class="footer-anchor embed-anchor"
                  @click="
                    layout.embeds[index].footer = !layout.embeds[index].footer
                  "
                >
                  <ArrowIcon
                    :style="
                      layout.embeds[index].footer
                        ? ''
                        : 'transform: rotate(-90deg)'
                    "
                  />
                  <span>Footer</span>
                </div>
                <div
                  class="editable-footer"
                  v-show="layout.embeds[index].footer"
                >
                  <!-- MARK: Embed footer text -->
                  <div class="footer-text">
                    <label :for="`footer_text_${index}`">Footer text</label>
                    <Input
                      autocomplete="off"
                      type="text"
                      :id="`footer_text_${index}`"
                      v-model="embed.footer.text"
                    />
                  </div>

                  <!-- MARK: Embed footer icon -->
                  <div class="footer-icon-url">
                    <label :for="`footer_icon_url_${index}`"
                      >Footer icon URL</label
                    >
                    <Input
                      autocomplete="off"
                      type="text"
                      :id="`footer_icon_url_${index}`"
                      v-model="embed.footer.icon_url"
                    />
                  </div>

                  <!-- MARK: Embed footer timestamp -->
                  <div class="footer-timestamp">
                    <label :for="`footer_timestamp_${index}`">Timestamp</label>
                    <Input
                      autocomplete="off"
                      type="datetime-local"
                      :id="`footer_timestamp_${index}`"
                      @change="updateDate(index, $event.target.value)"
                    />
                    <Button @click="embed.timestamp = ''">
                      <DeleteIcon />
                    </Button>
                  </div>
                </div>

                <!-- MARK: Embed fields -->
                <div
                  class="fields-anchor embed-anchor"
                  @click="
                    layout.embeds[index].fields = !layout.embeds[index].fields
                  "
                >
                  <ArrowIcon
                    :style="
                      layout.embeds[index].fields
                        ? ''
                        : 'transform: rotate(-90deg)'
                    "
                  />
                  <span>Fields</span>
                </div>
                <div
                  class="editable-fields"
                  v-show="layout.embeds[index].fields"
                >
                  <div
                    class="editable-field"
                    v-for="(field, f_index) in embed.fields"
                  >
                    <!-- MARK: Embed field -->
                    <div
                      class="embed-anchor field-anchor"
                      @click="
                        layout.embeds[index].field[f_index] =
                          !layout.embeds[index].field[f_index]
                      "
                    >
                      <span class="toggle-field"
                        ><ArrowIcon
                          :style="
                            layout.embeds[index].field[f_index]
                              ? ''
                              : 'transform: rotate(-90deg)'
                          "
                        />Field {{ f_index + 1 }}</span
                      >
                      <Button @click="removeField(index, f_index)">
                        <DeleteIcon />
                      </Button>
                    </div>
                    <div
                      class="field-content"
                      v-show="layout.embeds[index].field[f_index]"
                    >
                      <!-- MARK: Embed field name -->
                      <label :for="`field_name_${index}_${f_index}`"
                        >Field name</label
                      >
                      <Input
                        autocomplete="off"
                        type="text"
                        :id="`field_name_${index}_${f_index}`"
                        v-model="field.name"
                      />

                      <!-- MARK: Embed field value -->
                      <label :for="`field_value_${index}_${f_index}`"
                        >Field value</label
                      >
                      <Textarea
                        autocomplete="off"
                        :id="`field_value_${index}_${f_index}`"
                        v-model="field.value"
                      ></Textarea>
                    </div>
                  </div>

                  <!-- MARK: Embed fields actions -->
                  <Button @click="addNewField(index)">Add Field</Button>
                </div>
              </div>
            </div>
          </div>

          <!-- MARK: Navigation actions -->
          <div class="navigation">
            <Button @click="addNewEmbed" color="secondary">Add Embed</Button>
            <Button disabled>Add Component</Button>
            <Button @click="layout.showJsonEditor = !layout.showJsonEditor" :color="layout.showJsonEditor ? 'secondary' : 'default'">
              Json Editor
            </Button>
          </div>

          <!-- MARK: Json editor -->
          <div class="json-editor" v-if="layout.showJsonEditor">
            <Textarea
              style="min-height: 300px"
              @input="updateJsonData"
              v-model="jsonData"
            />
          </div>
        </div>

        <!-- MARK: Preview -->
        <div class="preview-wrapper">
          <Message
            v-if="this.messageData.id"
            :message="messageData"
            :ignoreContextMenu="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DeleteIcon from "../components/icons/DeleteIcon.vue";
import ArrowIcon from "../components/icons/ArrowIcon.vue";
import Message from "../components/message/Message.vue";
import Button from "../components/base/Button.vue";
import Input from "../components/base/Input.vue";
import Textarea from "../components/base/Textarea.vue";
import { useAppStore } from "../stores/app.js";
export default {
  components: { Message, DeleteIcon, ArrowIcon, Button, Input, Textarea },
  data() {
    return {
      apx: useAppStore(),
      layout: {
        showJsonEditor: false,
        embeds: [],
        beforeOpen: { // used to restore layout after embed editor is closed
          members: false,
          channels: false,
        },
      },
      messageData: {
        id: 1,
        author: useAppStore().user,
        content: useAppStore().data.textInput.message.content || "",
        timestamp: new Date().toISOString(),
        embeds: useAppStore().data.textInput.message.embeds || [],
      },
    };
  },
  beforeMount() {
    this.updateJsonData(null);
    if (this.apx.data.textInput.message.embeds) {
      for (const index in this.apx.data.textInput.message.embeds) {
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
      }
    }
  },
  mounted() {
    this.layout.beforeOpen.members = this.apx.layout.showMembers;
    this.apx.layout.showMembers = false;
    this.layout.beforeOpen.channels = this.apx.layout.showChannels;
    this.apx.layout.showChannels = false;
  },
  beforeUnmount() {
    this.apx.layout.showMembers = this.layout.beforeOpen.members;
    this.apx.layout.showChannels = this.layout.beforeOpen.members;
  },
  methods: {
    addEmbedsToMessage() {
      this.apx.data.textInput.message.embeds = this.messageData.embeds;
      this.$router.push(
        `/server/${this.apx.data.currentServerId}/${this.apx.data.currentChannelId}`
      );
    },
    handleCancel() {
      this.$router.push(
        `/server/${this.apx.data.currentServerId}/${this.apx.data.currentChannelId}`
      );
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
      console.debug("Embed input", object);
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
        for (const index in object) {
          this.layout.embeds.push({
            show: true,
            author: false,
            data: true,
            images: false,
            footer: false,
            fields: false,
            field: [],
          });
        }

        console.debug("Embed output", this.messageData);
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
