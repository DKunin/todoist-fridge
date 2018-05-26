'use strict';

const template = `<div>
        <h2>Settings</h2>
        <form @submit="handleSubmit">
            <input :value="settings.api_key" name="api_key" type="text" placeholder="Api key"/>
            <input :value="settings.list_query" name="list_query" type="text" placeholder="List query" />
            <button class="button">Save</button>
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
            setTimeout(() => {
                window.location.reload();
            }, 500)
        }
    },
    data() {
        return {

        };
    },
    template
};

export default settingsPage;
