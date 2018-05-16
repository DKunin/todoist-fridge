'use strict';

const template = `<div>
        <h2>Settings</h2>
        <form @submit="handleSubmit">
            <div>
                <input :value="settings.api_key" name="api_key" type="text" placeholder="Api key"/>
            </div>
            <div>
                <input :value="settings.list_query" name="list_query" type="text" placeholder="List query" />
            </div>
            <button>Save</button>
        </form>
    </div>`;

const settingsPage = {
    computed: {
        settings() {
            return this.$store.state.settings;
        }
    },
    mounted() {},
    methods: {
        handleSubmit(event) {
            event.preventDefault();
            const data = event.target;
            this.$store.commit('updateSettings', {
                key: 'list_query',
                value: data['list_query'].value
            });
            this.$store.commit('updateSettings', {
                key: 'api_key',
                value: data['api_key'].value
            });
        }
    },
    data() {
        return {

        };
    },
    template
};

export default settingsPage;
